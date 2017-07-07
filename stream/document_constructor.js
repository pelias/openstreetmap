
/**
  The document constructor is responsible for mapping input data from the parser
  in to model.Document() objects which the rest of the pipeline expect to consume.
**/

var through = require('through2');
var Document = require('pelias-model').Document;
var peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );

module.exports = function(){

  var stream = through.obj( function( item, enc, next ) {

    try {
      if (!item.type || ! item.id) {
        throw new Error('doc without valid id or type');
      }
      var uniqueId = [ item.type, item.id ].join(':');

      // we need to assume it will be a venue and later if it turns out to be an address it will get changed
      var doc = new Document( 'openstreetmap', 'venue', uniqueId );

      // Set latitude / longitude
      if( item.hasOwnProperty('lat') && item.hasOwnProperty('lon') ){
        doc.setCentroid({
          lat: item.lat,
          lon: item.lon
        });
      }

      // Set latitude / longitude (for ways where the centroid has been precomputed)
      else if( item.hasOwnProperty('centroid') ){
        if( item.centroid.hasOwnProperty('lat') && item.centroid.hasOwnProperty('lon') ){
          doc.setCentroid({
            lat: item.centroid.lat,
            lon: item.centroid.lon
          });
        }
      }

      // Store osm tags as a property inside _meta
      doc.setMeta( 'tags', item.tags || {} );

      // Push instance of Document downstream
      this.push( doc );
    }

    catch( e ){
      peliasLogger.error( 'error constructing document model', e.stack );
    }

    return next();

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};
