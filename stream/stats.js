
var through = require('through2');

function Stats(){
  this.reset();
}

Stats.prototype.reset = function(){
  this.metrics = {};
}

Stats.prototype.proxy = function( title ){
  if( !this.metrics.hasOwnProperty( title ) ){
    this.metrics[ title ] = 0;
  }

  var self = this;

  var proxy = through.obj( function( item, enc, next ) {
    self.metrics[ title ]++;
    this.push( item );
    return next();
  });

  return proxy;
};

module.exports = new Stats();