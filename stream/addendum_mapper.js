/**
  The addendum mapper is responsible for adding interesting metadata
  as an 'addendum' to the record.

  @see: https://github.com/pelias/api/pull/1255
**/

const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');
const whitelist = [
  'wheelchair', // Wheelchair accessibility
  'iata', // IATA airport codes
  'icao', // ICAO airport codes
  'wikidata', // Wikidata concordance
  'wikipedia', // Wikipedia concordance
  'website', // Website URL
  'phone', // Telephone number
  'opening_hours', // Opening hours
];

module.exports = function(){

  return through.obj(( doc, enc, next ) => {

    try {

      // skip records with no tags
      let tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }

      let addendum = {};

      // iterate over mapping
      whitelist.forEach(key => {

        // check each whitelist key against document tags
        if( !tags.hasOwnProperty( key ) ){ return; }

        // set addendum key
        let value = tags[key].trim();
        if( !!value.length ){
          addendum[ key ] = value;
        }
      });

      // set document addendum
      if( !!Object.keys( addendum ).length ){
        doc.setAddendum( 'osm', addendum );
      }
    }

    catch( e ){
      peliasLogger.error( 'addendum_mapper error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
    }

    return next( null, doc );

  });

};
