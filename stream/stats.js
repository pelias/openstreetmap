
var through = require('through2');
var store, pipes;

var stats = function( title ){

  var stream = through.obj( function( item, enc, done ) {

    if( !store[ title ] ){ store[ title ] = 0; }
    store[ title ]++;

    this.push( item, enc );
    return done();

  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  // start logging on first pipe
  stream.on( 'pipe', function(){
    pipes++;
    if( pipes === 1 ){
      module.exports.interval = setInterval( function(){
        if( stats.enabled ){
          stream.log( store );
        }
      }, 500 );
      // module.exports.interval.unref();
    }
  });

  // stop logging and clear interval when done
  stream.on( 'unpipe', function(){
    pipes--;
    if( pipes === 0 ){
      if( stats.enabled ){
        stream.log( store );
      }
      clearInterval( module.exports.interval );
      stream.emit( 'clear' );
    }
  });

  stream.log = function( store ){
    console.error( JSON.stringify( store, null, 2 ) );
  };

  return stream;
};

// export a reset function for unit testing
stats._reset = function(){
  store = {};
  pipes = 0;
  stats.enabled = true;
};
stats._reset();

module.exports = stats;
