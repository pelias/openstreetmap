
var through = require('through2'),
    features = require('../features');

module.exports = function( id, message ){

  var stream = through.obj( function( record, enc, done ) {

    console.log( record.id, id );
    if( ''+record.id == ''+id ){
      console.error( message || 'id found' );
      console.error( JSON.stringify( record, null, 2 ) );
      process.exit(1);
    }

    this.push( record, enc );
    return done();
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}