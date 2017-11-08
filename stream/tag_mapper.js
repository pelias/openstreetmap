
/**
  The tag mapper is responsible for mapping OSM tag information in to the
  document model, using a variety of different schemas found in /schema/*.
**/

var through = require('through2'),
    _ = require('lodash'),
    merge = require('merge'),
    peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );

var LOCALIZED_NAME_KEYS = require('../config/localized_name_keys');
var NAME_SCHEMA = require('../schema/name_osm');
var ADDRESS_SCHEMA = merge( true, false,
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

      // Unfortunately we need to iterate over every tag,
      // so we only do the iteration once to save CPU.
      for( var tag in tags ){

        // Map localized names which begin with 'name:'
        // @ref: http://wiki.openstreetmap.org/wiki/Namespace#Language_code_suffix
        var suffix = getNameSuffix( tag );
        if( suffix ){
          var val1 = trim( tags[tag] );
          if( val1 ){
            doc.setName( suffix, val1 );
          }
        }

        // Map name data from our name mapping schema
        else if( tag in NAME_SCHEMA ){
          var val2 = trim( tags[tag] );
          if( val2 ){
            doc.setName( NAME_SCHEMA[tag], val2 );
          }
        }

        // Map address data from our address mapping schema
        else if( tag in ADDRESS_SCHEMA ){
          var val3 = trim( tags[tag] );
          if( val3 ){
            doc.setAddress( ADDRESS_SCHEMA[tag], val3 );
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
