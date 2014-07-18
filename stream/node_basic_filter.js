
var through = require('through2');
var stream = through.obj( function( node, enc, done ) {

  // filter nodes missing requires properties
  if( node && node.hasOwnProperty('id')
           && node.hasOwnProperty('lat')
           && node.hasOwnProperty('lon') ){

    // only accept nodes with id, lat & lon set
    this.push( node );
  }

  return done();
});

module.exports = stream;