
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

      // housenumber is required
      if (!_.has(tags, 'addr:housenumber')){
        return next( null, doc );
      }

      const street = _.get(tags, 'addr:street', '').trim();
      const place = _.get(tags, 'addr:place', '').trim();

      // when street is unset but place is set, use place for the street name
      if (_.isEmpty(street) && !_.isEmpty(place)) {
        _.set(tags, 'addr:street', place);
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
