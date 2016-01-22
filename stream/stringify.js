var through = require('through2');

// convenience function for converting object streams back to strings
var stringify = through.obj( function( data, enc, next ){
  this.push( JSON.stringify( data, null, 2 ), 'utf-8' );
  next();
});

module.exports = stringify;