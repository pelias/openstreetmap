
var through = require('through2');

module.exports = through.obj( function( row, enc, next ) {
  next();
});