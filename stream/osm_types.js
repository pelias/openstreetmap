
var through = require('through2');

module.exports = function( streams ){
  if( !streams || !streams.node || !streams.way || !streams.relation ){
    throw new Error( 'invalid types stream constructor' );
  }

  var stream = through.obj( function( data, enc, done ) {

    // forward the data to the appropriate stream
    var forward = function( item, enc, next ){
      if( ['node','way','relation'].indexOf( item.type ) === -1 ){
        console.error( 'unknown type', item.type );
        return next();
      }
      return streams[ item.type ].write( item, enc, setImmediate.bind( this, next ) );
    }
    
    // data is an array of items
    if( Array.isArray( data ) ){
      var shift = function(){
        if( !data.length ) return done();
        forward( data.shift(), enc, shift );
      }
      shift();
    }

    // data is a single item
    else {
      forward( data, enc, done );
    }

  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}