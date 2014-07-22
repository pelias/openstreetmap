
var through = require('through2');

module.exports = function(){

  var stream = through.obj( function( data, enc, next ) {
    
    if( Array.isArray( data ) ){
      data.forEach( function( item ){
        this.push( JSON.stringify( item, null, 2 ) );
      }, this );
    } else {
      this.push( JSON.stringify( data, null, 2 ) );
    }
    next();

  });

  return stream;
}