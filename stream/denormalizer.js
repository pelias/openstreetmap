
var through = require('through2'),
    geoJsonCenter = require('../util/geoJsonCenter'),
    geoJsonTypeFor = require('../util/geoJsonTypeFor');

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

      doc.setCentroid( geoJsonCenter( geo ) );

      this.push( doc );
      next();

    } catch( e ){
      console.log( 'failed to denormalize way', e );
      next();
    }
  });
}

module.exports = denormalizer;