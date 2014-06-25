
var through = require('through2');

var stringify = through.obj( function( data, enc, next ) {
  
  if( Array.isArray( data ) ){
    data.forEach( function( item ){
      this.push( JSON.stringify( item, null, 2 ) );
    }, this );
  } else {
    this.push( JSON.stringify( data, null, 2 ) );
  }
  next();

});

module.exports = stringify;