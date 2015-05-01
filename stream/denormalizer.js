
/**
  The denormalizer is responsible taking information about the nodes which are
  part of an OSM way record; assembling the polygon and computing it's centroid.

  Much of the heavy lifting here is performed by the parser directly, meaning we
  no longer need to manage a leveldb cache and perform lookups in this module.
**/

var through = require('through2'),
    isObject = require('is-object'),
    geoJsonCenter = require('../util/geoJsonCenter'),
    geoJsonTypeFor = require('../util/geoJsonTypeFor'),
    peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );

// convert de-normalized ways to geojson
function denormalizer(){
  return through.obj( function( doc, enc, next ){

    // skip non-way docs
    if( doc.getType() !== 'osmway'){
      this.push( doc );
      return next();
    }

    try {

      var nodes = doc.getMeta('nodes');
      if( !nodes ){ return next(); }

      var points = nodes.map( function( doc ){
        return [ doc.lon, doc.lat ];
      });

      var geo = {
        type: geoJsonTypeFor( points ),
        coordinates: points
      };

      var center = geoJsonCenter( geo );
      if( isObject( center ) ){
        doc.setCentroid( center );
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
