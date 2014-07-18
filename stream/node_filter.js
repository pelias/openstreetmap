
var through = require('through2'),
    features = require('../features');

var stream = through.obj( function( node, enc, done ) {

  // filter nodes missing requires properties
  if( node && node.hasOwnProperty('id')
           && node.hasOwnProperty('lat')
           && node.hasOwnProperty('lon')
           && 'object' == typeof node.tags
           && 'string' == typeof node.tags.name
           && !!Object.keys( node.tags ).length
           && features.getFeature( node ) ){
    this.push( node );
  }

  return done();
});

module.exports = stream;