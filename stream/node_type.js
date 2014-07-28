
var through = require('through2')
    features = require('../features');

module.exports = function(){

  var stream = through.obj( function( node, enc, done ) {

    // nodes with no name are not POIs in their own right
    if( !node.name || !node.name.default ){
      node._type = 'osmpoint';
    }

    // nodes with no tags are not POIs in their own right
    else if( 'object' !== typeof node.tags || !Object.keys( node.tags ).length ){
      node._type = 'osmpoint';
    }

    // nodes not in our feature list are not POIs in their own right
    else {
      var feature = features.getFeature( node );
      if( !feature ){
        node._type = 'osmpoint';
      }
    }

    // forward down the pipeline
    this.push( node );
    return done();
  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}