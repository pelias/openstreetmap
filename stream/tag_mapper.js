
/**
  The tag mapper is responsible for mapping OSM tag information in to the
  document model, using a variety of different schemas found in /schema/*.
**/

const _ = require('lodash');
const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');
const parseSemicolonDelimitedValues = require('../util/parseSemicolonDelimitedValues');

const LOCALIZED_NAME_KEYS = require('../config/localized_name_keys');
const NAME_SCHEMA = require('../schema/name_osm');
const ADDRESS_SCHEMA = _.merge( {},
  require('../schema/address_tiger'),
  require('../schema/address_osm'),
  require('../schema/address_naptan'),
  require('../schema/address_karlsruhe')
);

module.exports = function(){

  const stream = through.obj( function( doc, enc, next ) {

    try {

      // skip records with no tags
      var tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }

      // Unfortunately we need to iterate over every tag,
      // so we only do the iteration once to save CPU.
      _.each(tags, (value, key) => {

        // Map localized names which begin with 'name:'
        // @ref: http://wiki.openstreetmap.org/wiki/Namespace#Language_code_suffix
        const langCode = getNameSuffix( key );
        if( langCode ){
          const langValues = parseSemicolonDelimitedValues( value );
          langValues.forEach(( langValue, i ) => {
            if ( i === 0 ) {
              doc.setName( langCode, langValue );
            } else {
              doc.setNameAlias( langCode, langValue );
            }
          });
        }

        // Map name data from our name mapping schema
        else if( _.has(NAME_SCHEMA, key) ){
          const nameValues = parseSemicolonDelimitedValues( cleanString( value ) );
          nameValues.forEach(( nameValue, i ) => {
            // For the primary name key 'name', ensure it is the first value
            if( 'name' === key && i === 0 ){
              doc.setName(NAME_SCHEMA[key], nameValue);
              return;
            }

            // Otherwise set as an alias
            doc.setNameAlias( NAME_SCHEMA[key], nameValue );
          });
        }

        // Map address data from our address mapping schema
        else if( _.has(ADDRESS_SCHEMA, key) ){
          const addrValue = cleanString( value );
          if( addrValue ){
            const label = ADDRESS_SCHEMA[key];
            doc.setAddress(label, normalizeAddressField(label, addrValue));
          }
        }
      });

      // Handle the case where no default name was set but there were
      // other names which we could use as the default.
      if( !doc.getName('default') ){

        const defaultName = [
          ...parseSemicolonDelimitedValues(_.get(tags, 'official_name')),
          ...parseSemicolonDelimitedValues(_.get(tags, 'int_name')),
          ...parseSemicolonDelimitedValues(_.get(tags, 'nat_name')),
          ...parseSemicolonDelimitedValues(_.get(tags, 'reg_name')),
          ...parseSemicolonDelimitedValues(doc.getName('en'))
        ].filter(Boolean);

        // use one of the preferred name tags listed above
        if ( defaultName.length ){
          doc.setName('default', defaultName[0]);
        }

        // else try to use an available two-letter language name tag
        else {
          const keys = Object.keys(doc.name).filter(n => n.length === 2);

          // unambiguous (there is only a single two-letter name tag)
          if ( keys.length === 1 ){
            doc.setName('default', doc.getName(keys[0]));
          }

          // note we do not handle ambiguous cases where the record contains >1
          // two-letter name tags.
          // see: https://github.com/pelias/openstreetmap/pull/498
        }
      }

      // Import airport codes as aliases
      if( tags.hasOwnProperty('aerodrome') || tags.hasOwnProperty('aeroway') ){
        if( tags.hasOwnProperty('iata') ){
          const iata = cleanString( tags.iata );
          if( iata ){
            doc.setNameAlias( 'default', iata );
            doc.setNameAlias( 'default', `${iata} Airport` );
          }
        }
      }
    }

    catch( e ){
      peliasLogger.error( 'tag_mapper error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
    }

    return next( null, doc );

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};

// Clean string of leading/trailing junk chars
function cleanString( str ){
  return _.trim( str, '#$%^*<>-=_{};:",./?\t\n\' ' );
}

// extract name suffix, eg for 'name:EN' return 'en'
// if not valid, return false.
function getNameSuffix( tag ){

  if( tag.length < 6 || tag.substr(0,5) !== 'name:' ){
    return false;
  }

  // normalize suffix
  var suffix = tag.substr(5).toLowerCase();

  // check the suffix is in the localized key list
  if( LOCALIZED_NAME_KEYS.indexOf(suffix) === -1 ){
    return false;
  }

  return suffix;
}

// apply some very basic normalization
// note: in the future we should consider doing something more advanced like:
// https://github.com/pelias/openaddresses/pull/477
function normalizeAddressField(key, value) {
  if (key === 'street') {

    // contract English diagonals
    value = value
      .replace(/\b(northwest)\b/i, 'NW')
      .replace(/\b(northeast)\b/i, 'NE')
      .replace(/\b(southwest)\b/i, 'SW')
      .replace(/\b(southeast)\b/i, 'SE');
  }

  return value;
}
