
var through = require('through2'),
    features = require('../features');

function isAddress( node ){
  return( node.tags.hasOwnProperty('addr:housenumber') && node.tags.hasOwnProperty('addr:street') );
}

function isPOIFromFeatureList( node ){
  return( 'string' === typeof node.tags.name && !!features.getFeature( node ) );
}

module.exports = function(){

  var stream = through.obj( function( node, enc, done ) {

    // filter nodes missing requires properties
    if( !!node &&
        node.hasOwnProperty('id') &&
        node.hasOwnProperty('lat') &&
        node.hasOwnProperty('lon') &&
        'object' == typeof node.tags && (
          isAddress( node ) ||
          isPOIFromFeatureList( node )
        )){
          this.push( node );
        }

    return done();
  });


  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};