
var through = require('through2'),
    features = require('../features');

module.exports = function(){

  var stream = through.obj( function( item, enc, done ) {

    // filter items missing the features we require
    if( item && 'object' == typeof item.tags
             && !!Object.keys( item.tags ).length
             && features.getFeature( item ) ){
      this.push( item );
    }

    return done();
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}