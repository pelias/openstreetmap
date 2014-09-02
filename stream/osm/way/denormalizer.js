
var through = require('through2');
var geoJsonCenter = require('../../../util/geoJsonCenter');
var geoJsonTypeFor = require('../../../util/geoJsonTypeFor');
var codec = require('../../../util/centroidCodec');

module.exports = function( client ){

  var stream = through.obj( function( way, enc, done ) {

    // console.log( JSON.stringify( way, null, 2 ) );

    // if( way && (''+way.id) == '79338918' ){ // city farm
    //   console.error( 'city farm denormalizer' );
    //   console.error( JSON.stringify( way, null, 2 ) );
    // }

    getNodeIdsAsGeoJSON( client, way.refs, function( err, geoJson ){

      // if( way && (''+way.id) == '79338918' ){ // city farm
      //   console.error( 'city farm getNodeIdsAsGeoJSON' );
      //   console.error( err, geoJson );
      // }

      if( err ){
        console.error( 'getNodeIdsAsGeoJSON error', err );
        return done();
      }

      way.geo = geoJson;
      way.center_point = geoJsonCenter( geoJson );
      delete way.refs;

      this.push( way, enc );
      done();

    }.bind(this));

  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}

function getNodeIdsAsGeoJSON( client, ids, cb ){

  client.mget( ids, null, function( err, resp ){

    if( err ){
      console.log( 'getNodeIdsAsGeoJSON: an error occurred: ', err );
      return cb( err );
    }

    // leveldb
    else if( 'object' === typeof resp ){

      var points = [];
      for( var key in resp ){
        var doc = codec.decode( resp[key] );
        points.push([ doc.lon, doc.lat ]);
      }

      return cb( undefined, {
        type: geoJsonTypeFor( points ),
        coordinates: points
      });
    }

    // elasticsearch
    // else if( Array.isArray( resp ) ){

    //   var points = resp.map( function( doc ){
    //     return [ doc.center_point.lon, doc.center_point.lat ];
    //   });

    //   return cb( undefined, {
    //     type: geoJsonTypeFor( points ),
    //     coordinates: points
    //   });
    // }

    else {
      console.log( 'getNodeIdsAsGeoJSON: mget failed' );
      return cb( 'mget failed' );
    }

  });
}