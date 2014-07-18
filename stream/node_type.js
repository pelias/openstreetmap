
var through = require('through2')
    features = require('../features');

var stream = through.obj( function( node, enc, done ) {

  // change es index '_type' property for known features
  if( node && 'object' == typeof node.tags && !!Object.keys( node.tags ).length ){
    var feature = features.getFeature( node );
    if( feature ){
      node._type = feature;
    }
  }

  // forward down the pipeline
  this.push( node );
  return done();
});

module.exports = stream;