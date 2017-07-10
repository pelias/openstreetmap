
/**
  The denormalizer is responsible taking information about the nodes which are
  part of an OSM way record; assembling the polygon and computing it's centroid.

  Much of the heavy lifting here is performed by the parser directly, meaning we
  no longer need to manage a leveldb cache and perform lookups in this module.
**/

var through = require('through2'),
    isObject = require('is-object'),
    geometryUtil = require('../util/geometryUtil'),
    peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' ),
    _ = require('lodash');

// convert de-normalized ways to geojson
function denormalizer(){
  return through.obj( function( doc, enc, next ){

    // skip non-way docs
    if( doc.getId().indexOf('way') === -1 ){
      this.push( doc );
      return next();
    }

    try {

      var nodes = doc.getMeta('nodes');
      if( nodes ){

        var points = nodes.map( function( doc ){
          return {
            longitude: doc.lon,
            latitude: doc.lat
          };
        });

        // compute the bounding box of the geometry
        var bbox = geometryUtil.computeBBox( points );
        if( isObject( bbox ) ) {
          doc.setBoundingBox(bbox);
        }

        // only compute centroids where they have not already
        // been computed (avoid doing double work)
        if (_.isEmpty(doc.getCentroid())) {
          var center = geometryUtil.computeCenter(points);
          if (isObject(center)) {
            doc.setCentroid(center);
          }
        }

      }

      this.push( doc );
      next();

    } catch( e ){
      peliasLogger.error( 'failed to denormalize way', e );
      next();
    }
  });
}

module.exports = denormalizer;
