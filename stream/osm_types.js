
var through = require('through2');

module.exports = function( streams ){
  if( !streams || !streams.hasOwnProperty( 'node' ) ||
      !streams.hasOwnProperty( 'way' ) || !streams.hasOwnProperty( 'relation' ) ){
    throw new Error( 'invalid types stream constructor' );
  }
  var stream = through.obj( function( row, enc, done ) {
    var next = function(){
      if( !row.length ) return done();
      var item = row.shift();
      if( ['node','way','relation'].indexOf( item.type ) === -1 ){
        console.error( 'unknown type', item.type );
        return next();
      }
      return streams[ item.type ].write( item, enc, setImmediate.bind( this, next ) );
    }
    next();
  });

  return stream;
}