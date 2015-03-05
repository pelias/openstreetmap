
var through = require('through2'),
    isObject = require('is-object'),
    extend = require('extend'),
    Document = require('pelias-model').Document,
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

    var isNamedPoi = !!item.getName('default');

    // create a new record for street addresses
    if( hasValidAddress( item ) ){
      var type = isNamedPoi ? 'poi-address' : 'address';

      // copy data to new document
      var record = new Document( 'osmaddress', type + '-' + item.getType() + '-' + (item.getId() || ++idOrdinal) );

      record
        .setName( 'default', item.address.number + ' ' + item.address.street )
        .setCentroid( item.getCentroid() );

      // copy address info
      record.address = item.address;

      // copy admin data
      if( item.alpha3 ){ record.setAlpha3( item.alpha3 ); }
      if( item.admin0 ){ record.setAdmin( 'admin0', item.admin0 ); }
      if( item.admin1 ){ record.setAdmin( 'admin1', item.admin1 ); }
      if( item.admin1_abbr ){ record.setAdmin( 'admin1_abbr', item.admin1_abbr ); }
      if( item.admin2 ){ record.setAdmin( 'admin2', item.admin2 ); }
      if( item.local_admin ){ record.setAdmin( 'local_admin', item.local_admin ); }
      if( item.locality ){ record.setAdmin( 'locality', item.locality ); }
      if( item.neighborhood ){ record.setAdmin( 'neighborhood', item.neighborhood ); }
      
      // copy meta data (but maintain the id & type assigned above)
      record._meta = extend( true, {}, item._meta, { id: record.getId(), type: record.getType() } );

      this.push( record );
    }

    // forward item downstream is it's a POI in it's own right
    // note: this MUST be below the address push()
    if( isNamedPoi ){
      this.push( item );
    }

    return done();
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};

// export for testing
module.exports.hasValidAddress = hasValidAddress;