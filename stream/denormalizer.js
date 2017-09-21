
/**
  The denormalizer is responsible taking information about the nodes which are
  part of an OSM way record; assembling the polygon and computing it's centroid.

  Much of the heavy lifting here is performed by the parser directly, meaning we
  no longer need to manage a leveldb cache and perform lookups in this module.
**/

var through = require('through2'),
    peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' ),
    _ = require('lodash');

// convert de-normalized ways to geojson
function denormalizer(){
  return through.obj( function( doc, enc, next ){

    // skip non-way docs
    if( doc.getId().indexOf('way') === -1 && doc.getId().indexOf('relation') === -1){
      this.push( doc );
      return next();
    }

    try {

      var bboxmin = doc.getMeta('BBoxMin');
      var bboxmax = doc.getMeta('BBoxMax');
      if( bboxmin && bboxmax ) {
        var bbox = {
          min_lat: bboxmin.lat,
          max_lat: bboxmax.lat,
          min_lon: bboxmin.lon,
          max_lon: bboxmax.lon
        };
        doc.setBoundingBox(bbox);
      }

      this.push( doc );
      next();

    } catch( e ){
      peliasLogger.error( 'failed to denormalize', e );
      next();
    }
  });
}

module.exports = denormalizer;
