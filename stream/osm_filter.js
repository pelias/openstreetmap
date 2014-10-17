
var through = require('through2'),
    features = require('../features');

function isAddress( item ){
  return( item.tags.hasOwnProperty('addr:housenumber') && item.tags.hasOwnProperty('addr:street') );
}

function isPOIFromFeatureList( item ){
  return( 'string' === typeof item.tags.name && !!features.getFeature( item ) );
}

module.exports = function(){

  var stream = through.obj( function( item, enc, done ) {

    // filter items missing requires properties
    if( !!item &&
        item.hasOwnProperty('id') &&
        ((
          item.type === 'node' &&
          item.hasOwnProperty('lat') &&
          item.hasOwnProperty('lon')
        ) || (
          item.type === 'way' &&
          Array.isArray( item.refs ) &&
          item.refs.length > 0
        )) &&
        'object' == typeof item.tags && (
          isAddress( item ) ||
          isPOIFromFeatureList( item )
        )){
          this.push( item );
        }

    return done();
  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};