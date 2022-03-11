
/**
  This stream is responsible for filling 'addr:street' if is empty or missing,
  with 'addr:place' value. Note that both 'addr:place' and 'addr:housenumber'
  must be present inside tags!

  @ref https://github.com/pelias/openstreetmap/pull/565
**/

const _ = require('lodash');
const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');


module.exports = function(){

  var stream = through.obj( function( doc, enc, next ) {

    try {

      // skip records with no tags
      var tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }

      // fill addr:street with addr:place if missing
      var street = tags['addr:street'] || '';
      if (
        street === '' &&  // override also if street tag is empty
        tags.hasOwnProperty('addr:place') &&
        tags.hasOwnProperty('addr:housenumber')
      ) {
        tags['addr:street'] = tags['addr:place'];
      }
    }

    catch( e ){
      peliasLogger.error( 'addresses_without_street error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
    }

    return next( null, doc );

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};
