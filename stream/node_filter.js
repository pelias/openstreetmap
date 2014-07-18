
var through = require('through2');
var stream = through.obj( function( node, enc, done ) {

  // filter nodes missing requires properties
  if( node && node.hasOwnProperty('id')
           && node.hasOwnProperty('lat')
           && node.hasOwnProperty('lon')
           && 'object' == typeof node.tags
           && !!Object.keys( node.tags ).length
           && hasFeature( node ) ){
    this.push( node );
  }

  return done();
});

var features = ( 'amenity building shop office public_transport cuisine railway sport natural tourism ' +
                 'leisure historic man_made landuse waterway aerialway aeroway craft military' ).split(' ');

function hasFeature( node ){
  for( var x=0; x<features.length; x++ ){
    if( node.tags.hasOwnProperty( features[x] ) ) return true;
  }
  return false;
}

module.exports = stream;