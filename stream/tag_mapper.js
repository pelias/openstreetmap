
/**
  The tag mapper is responsible for mapping OSM tag information in to the
  document model, using a variety of different schemas found in /schema/*.
**/

const _ = require('lodash');
const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');

var LOCALIZED_NAME_KEYS = require('../config/localized_name_keys');
var NAME_SCHEMA = require('../schema/name_osm');
var ADDRESS_SCHEMA = _.merge( {},
  require('../schema/address_tiger'),
  require('../schema/address_osm'),
  require('../schema/address_naptan'),
  require('../schema/address_karlsruhe')
);

module.exports = function(){

  var stream = through.obj( function( doc, enc, next ) {

    try {

      // skip records with no tags
      var tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }

      // primary name tag: 'name'
      if (_.has(tags, 'name')) {
        appendName(doc, 'default', _.get(tags, 'name'));
      }

      // Unfortunately we need to iterate over every tag,
      // so we only do the iteration once to save CPU.
      _.each(tags, (value, key) => {
        // primary field was mapped above
        if (key === 'name') { return; }

        // Map localized names which begin with 'name:'
        // @ref: http://wiki.openstreetmap.org/wiki/Namespace#Language_code_suffix
        var suffix = getNameSuffix(key);
        if (suffix) {
          appendName(doc, suffix, value);
        }

        // Map name data from our name mapping schema
        else if (_.has(NAME_SCHEMA, key)) {
          appendName(doc, _.get(NAME_SCHEMA, key), value);
        }

        // Map address data from our address mapping schema
        else if (_.has(ADDRESS_SCHEMA, key)) {
          appendAddress(doc, ADDRESS_SCHEMA[key], value);
        }
      });

      // Handle the case where no default name was set but there were
      // other names which we could use as the default.
      if( !doc.getName('default') ){

        var defaultName =
          _.get(tags, 'official_name') ||
          _.get(tags, 'int_name') ||
          _.get(tags, 'nat_name') ||
          _.get(tags, 'reg_name') ||
          doc.getName('en');

        // use one of the preferred name tags listed above
        if ( defaultName ){
          doc.setName('default', defaultName);
        }

        // else try to use an available two-letter language name tag
        else {
          var keys = Object.keys(doc.name).filter(n => n.length === 2);

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
          var iata = trim( tags.iata );
          if( iata ){
            appendName(doc, 'code', iata);
            appendName(doc, 'org', `${iata} Airport`);
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
function trim( str ){
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

/**
 * convenience function for appending names:
 *
 * - selects 'setName' or 'setNameAlias' appropriately.
 * - splits on ';', a common OSM convention for multi values.
 * - applies token normalization via trim().
 */
const appendName = (doc, label, value) => {
  if (!_.isString(value) || !value.length) { return; }

  value.split(';').forEach(name => {
    let initial = !doc.getName(label);
    let trimmed = trim(name);
    if (trimmed.length < 1) { return; }

    if (initial) {
      doc.setName(label, trimmed);
    } else {
      doc.setNameAlias(label, trimmed);
    }
  });
};

/**
 * convenience function for appending address components:
 *
 * - selects 'setAddress' or 'setAddressAlias' appropriately.
 * - applies token normalization via trim() & normalizeAddressField()
 */
const appendAddress = (doc, label, value) => {
  if (!_.isString(value) || !value.length) { return; }

  let initial = !doc.getAddress(label);
  let trimmed = normalizeAddressField(label, trim(value));
  if (trimmed.length < 1) { return; }

  if (initial) {
    doc.setAddress(label, trimmed);
  } else {
    doc.setAddressAlias(label, trimmed);
  }
};
