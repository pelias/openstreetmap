
var through = require('through2');
var esclient = require('pelias-esclient')();
// require( '../debugstats' )( esclient.stream );

var stream = through.obj( function( item, enc, done ) {

  // console.log( JSON.stringify( item, null, 2 ) );

  // findAdmin0( item.center_point, function( err, admin0 ){

  //   if( err ){
  //     console.error( 'findAdmin0 error', err );
  //     return done();
  //   }

  //   item.admin0 = admin0;

    this.push( item, enc );
    done();

  // }.bind(this));

});

function findAdmin0( ids, cb ){  

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

module.exports = stream;