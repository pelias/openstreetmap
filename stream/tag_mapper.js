
/**
  The tag mapper is responsible for mapping OSM tag information in to the
  document model, using a variety of different schemas found in /schema/*.
**/

var through = require('through2'),
    trimmer = require('trimmer'),
    merge = require('merge');

var NAME_SCHEMA = require('../schema/name_osm');
var ADDRESS_SCHEMA = merge( true, false,
  require('../schema/address_osm'),
  require('../schema/address_naptan'),
  require('../schema/address_karlsruhe')
);

module.exports = function(){

  var stream = through.obj( function( doc, enc, done ) {

    var tags = doc.getMeta('tags');
    if( tags ){

      // Unfortunately we need to iterate over every tag,
      // so we only do the iteration once to save CPU.
      for( var tag in tags ){

        // Map localized names which begin with 'name:'
        // @ref: http://wiki.openstreetmap.org/wiki/Namespace#Language_code_suffix
        if( tag.match('name:') ){
          var val1 = trim( tags[tag] );
          if( val1 ){
            doc.setName( tag.replace('name:',''), val1 );
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

    this.push( doc );
    done();

  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};

// Clean string of leading/trailing junk chars
function trim( str ){
  return trimmer( str, '#$%^*()<>-=_{};:",./?\' ' );
}