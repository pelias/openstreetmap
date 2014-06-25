
var through = require('through2');
var geoJsonCenter = require('../util/geoJsonCenter');
var geoJsonTypeFor = require('../util/geoJsonTypeFor');
var esclient = require('pelias-esclient')();
// require( '../debugstats' )( esclient.stream );

var normalizer = through.obj( function( way, enc, done ) {

  console.log( JSON.stringify( way, null, 2 ) );

  getNodeIdsAsGeoJSON( way.refs, function( err, geoJson ){

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

function getNodeIdsAsGeoJSON( ids, cb ){  

  esclient.mget({

    index: 'import', type: 'node',
    body: { ids: ids }
  
  }, function( error, response ){

    if( 'object' === typeof response && response.hasOwnProperty( 'docs' ) ){

      var invalid = response.docs.some( function( doc ){
        return !doc.found;
      });

      if( invalid ){
        console.log( 'node ids not found', response.docs );
        return cb( 'node not found!! -- broken-ness' );
      }

      var points = response.docs.map( function( doc ){
        return [ doc._source.center_point.lon, doc._source.center_point.lat ];
      });

      return cb( error, {
        type: geoJsonTypeFor( points ),
        coordinates: points
      });
    }

    else {
      console.log( 'response returned no docs!' );
      return cb( error || 'response returned no docs!' );
    }

  });
}

module.exports = normalizer;