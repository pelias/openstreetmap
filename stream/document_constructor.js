
/**
  The document constructor is responsible for mapping input data from the parser
  in to model.Document() objects which the rest of the pipeline expect to consume.
**/

var through = require('through2');
var Document = require('pelias-model').Document;
var peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );
var _ = require('lodash');

module.exports = function(){

  var stream = through.obj( function( item, enc, next ) {

    try {
      var uniqueId = ['osm', item.type, item.id].join('-');
      var doc = new Document( 'osm', item.type, uniqueId );

      // until we decouple source_id and _id in pelias-model, keep manually forcing source_id after construction
      // construct with unique id
      doc.setSourceId(item.id);

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

      // Set noderefs (for ways)
      if( item.hasOwnProperty('nodes') ){
        doc.setMeta( 'nodes', item.nodes );
      }

      // Store osm tags as a property inside _meta
      doc.setMeta( 'tags', item.tags || {} );

      //peliasLogger.info('[NEW DOC]', { source: 'osm', layer: item.type, id: item.id, centroid: doc.getCentroid()});

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
