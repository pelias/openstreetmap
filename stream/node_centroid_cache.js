
var through = require('through2'),
    codec = require('../util/centroidCodec');

var count = 0;

module.exports = function( backend ){

  var stream = through.obj( function( node, enc, done ) {

    backend.put( node.id, codec.encode( node ), function(err){
      if( err ) console.error( 'leveldb latlon cache failed', err );
    });

    this.push( node, enc );
    return done();

  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}