
/**
  The document constructor is responsible for mapping input data from the parser
  in to model.Document() objects which the rest of the pipeline expect to consume.
**/

var through = require('through2'),
    Document = require('pelias-model').Document,
    peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );

module.exports = function(){

  var stream = through.obj( function( item, enc, next ) {

    try {
      var doc = new Document( 'osm' + item.type, item.id );

      // Set latitude / longitude
      if( item.hasOwnProperty('lat') && item.hasOwnProperty('lon') ){
        doc.setCentroid({
          lat: item.lat,
          lon: item.lon
        });
      }

      // Set noderefs (for ways)
      if( item.hasOwnProperty('nodes') ){
        doc.setMeta( 'nodes', item.nodes );
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
