
var through = require('through2');
var store, active;

var stats = function( title ){

  var stream = through.obj( function( item, enc, done ) {

    if( !store.hasOwnProperty( title ) ){ store[ title ] = 0; }
    store[ title ]++;

    this.push( item, enc );
    return done();

  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  // start logging on first pipe
  stream.on( 'pipe', function( s ){
    s.uid = Math.round( Math.random() * 100000000 );
    active[ s.uid ] = s;
    // console.log( 'pipe', stream.uid );
    // process.exit(1);
    store.pipes++;
    if( store.pipes === 1 ){
      module.exports.interval = setInterval( function(){
        if( stats.enabled ){
          stream.log( store );
        }
      }, 500 );
      // module.exports.interval.unref();
    }
  });

  // stop logging and clear interval when done
  stream.on( 'unpipe', function( s ){
    delete active[ s.uid ];
    store.pipes--;
    if( store.pipes === 0 ){
      if( stats.enabled ){
        stream.log( store );
      }
      clearInterval( module.exports.interval );
      stream.emit( 'clear' );
    }
  });

  stream.log = function( store ){
    console.error( JSON.stringify( store, null, 2 ) );
    if( store.pipes < 5 ){
      for( var uid in active ){
        if( active[uid].hasOwnProperty('_transform') ){
          console.log( active[uid]._transform.toString() );
        } else {
          console.log( 'no transform' );
        }
      }
    }
    // console.error( active. );
  };

  return stream;
};

// export a reset function for unit testing
stats._reset = function(){
  store = { pipes: 0 };
  active = {};
  stats.enabled = true;
};
stats._reset();

module.exports = stats;
