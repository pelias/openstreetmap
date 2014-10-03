
var through = require('through2'),
    isObject = require('is-object'),
    idOrdinal = 0; // used for addresses lacking an id (to keep them unique)

function hasValidAddress( item ){
  if( !isObject( item ) ) return false;
  if( !isObject( item.address ) ) return false;
  if( 'string' !== typeof item.address.number ) return false;
  if( 'string' !== typeof item.address.street ) return false;
  if( !item.address.number.length ) return false;
  if( !item.address.street.length ) return false;
  return true;
}

module.exports = function(){

  var stream = through.obj( function( item, enc, done ) {

    var isNamedPoi = ( !!item.name && !!item.name.default );

    // create a new record for street addresses
    if( hasValidAddress( item ) ){
      var type = isNamedPoi ? 'poi-address' : 'address';
      var record = {
        id: type + '-' + item.type + '-' + (item.id || ++idOrdinal), // MUST BE UNIQUE!
        name: {
          default: item.address.number + ' ' + item.address.street
        },
        type: item.type,
        center_point: item.center_point,
        admin0: item.admin0,
        admin1: item.admin1,
        admin2: item.admin2,
        _meta: item._meta
      };
      this.push( record );
    }

    // forward item downstream is it's a POI in it's own right
    // note: this MUST be below the address push()
    if( isNamedPoi ){
      this.push( item );
    }

    return done();
  });

  // export for testing
  stream.hasValidAddress = hasValidAddress;

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};