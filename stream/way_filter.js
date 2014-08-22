
var through = require('through2'),
    features = require('../features');

module.exports = function(){

  var stream = through.obj( function( way, enc, done ) {

    // console.error( JSON.stringify( way, null, 2 ) );

    // filter ways missing requires properties
    if( way && way.hasOwnProperty('id')
             && 'object' == typeof way.name
             && 'string' == typeof way.name.default
             && 'object' == typeof way.tags
             && !!Object.keys( way.tags ).length
             && features.getFeature( way ) ){
      this.push( way );
    }

    return done();
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}