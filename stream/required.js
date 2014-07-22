
var through = require('through2');

function requiredType( type ){
  return through.obj( function( item, enc, done ) {
    // filter item unless they are the specific type
    if( type === 'array' && Array.isArray( type ) ){
      this.push( item, enc );
    } else if( type === typeof item ){
      this.push( item, enc );
    }
    return done();
  });
}

function requiredProperty( props ){
  return through.obj( function( item, enc, done ) {
    if( !Array.isArray( props ) ){ props = [ props ]; }
    // filter item unless they contain a specific property
    for( var x=0; x<props.length; x++ ){
      var prop = props[x];
      if( !item.hasOwnProperty( prop ) ){
        return done();
      }
    }
    this.push( item, enc );
    return done();
  });
}

module.exports = {
  type: requiredType,
  property: requiredProperty
};