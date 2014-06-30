
var through = require('through2');

module.exports = function( streams ){
  if( !streams || !streams.hasOwnProperty( 'node' ) ||
      !streams.hasOwnProperty( 'way' ) || !streams.hasOwnProperty( 'relation' ) ){
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

  return stream;
}