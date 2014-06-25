
var through = require('through2');

module.exports = through.obj( function( row, enc, next ) {

  var interval = 1000 + Math.round( Math.random() * 2000 );

  var cb = function(){
    this.push( row, enc );
    next();
  };

  setTimeout( cb.bind(this), interval );
});