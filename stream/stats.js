
var through = require('through2');

var store = {};

setInterval( function(){
  console.log( JSON.stringify( store, null, 2 ) );
}, 500 );

var stats = function( title ){

  var stream = through.obj( function( item, enc, done ) {

    if( !store[ title ] ){ store[ title ] = 0; }
    store[ title ]++;

    // console.log( 'stats!', title );
    this.push( item, enc );
    return done();

  });

  return stream;
}

module.exports = stats;