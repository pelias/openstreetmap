
var through = require('through2'),
    features = require('../features');

function isAddress( way ){
  return( way.tags.hasOwnProperty('addr:housenumber') && way.tags.hasOwnProperty('addr:street') );
}

function isPOIFromFeatureList( way ){
  if( 'object' !== typeof way.name ) return false;
  return( 'string' === typeof way.name.default && !!features.getFeature( way ) );
}

module.exports = function(){

  var stream = through.obj( function( way, enc, done ) {

    // filter ways missing requires properties
    if( !!way &&
        way.hasOwnProperty('id') &&
        'object' == typeof way.tags && (
          isAddress( way ) ||
          isPOIFromFeatureList( way )
        )){
          this.push( way );
        }

    return done();
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};