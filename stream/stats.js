
/**
  The stats module is useful for recording stats while developing new streams.

  @usage:

    tap.pipe( stream1 )
      .pipe( stats.proxy('stream1 -> stream2') )
      .pipe( stream2 )
      .pipe( stats.proxy('stream2 -> stream3') )
      .pipe( stream3 )
      .pipe( stats.proxy('stream3 -> sink') )
      .pipe( sink )

  you can then get throughput statistics in your terminal to identify bottlenecks:

    var peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );
    setInterval( peliasLogger.log.bind( peliasLogger, stats.metrics ), 1000 );
**/

var through = require('through2');

function Stats(){
  this.reset();
}

Stats.prototype.reset = function(){
  this.metrics = {};
};

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
