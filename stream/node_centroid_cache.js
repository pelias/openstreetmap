
var through = require('through2');

var count = 0;

module.exports = function( backend ){

  var stream = through.obj( function( node, enc, done ) {

    backend.put( node.id, { lat: node.lat, lon: node.lon }, function(err){
      if( err ) console.error( 'leveldb latlon cache failed', err );
    });

    this.push( node, enc );
    return done();

  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}