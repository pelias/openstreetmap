
/**
  The address extractor is responsible for cloning documents where a valid address
  data exists.

  The hasValidAddress() function examines the address property which was populated
  earier in the pipeline by the osm.tag.mapper stream and therefore MUST come after
  that stream in the pipeline or it will fail to find any address information.

  There are a few different outcomes for this stream depending on the data contained
  in each individual document, the result can be, 0, 1 or 2 documents being emitted.

  In the case of the document missing a valid doc.name.default string then it is not
  considered to be a point-of-interest in it's own right, it will be discarded.

  In the case where the document contains BOTH a valid house number & street name we
  consider this record to be an address in it's own right and we clone that record,
  duplicating the data across to the new doc instance while adjusting it's id and type.

  In a rare case it is possible that the record contains neither a valid name nor a valid
  address. If this case in encountered then the parser should be modified so these records
  are no longer passed down the pipeline; as they will simply be discarded because they are
  not searchable.
**/

var through = require('through2'),
    isObject = require('is-object'),
    extend = require('extend'),
    peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' ),
    Document = require('pelias-model').Document,
    idOrdinal = 0; // used for addresses lacking an id (to keep them unique)

function hasValidAddress( doc ){
  if( !isObject( doc ) ){ return false; }
  if( !isObject( doc.address ) ){ return false; }
  if( 'string' !== typeof doc.address.number ){ return false; }
  if( 'string' !== typeof doc.address.street ){ return false; }
  if( !doc.address.number.length ){ return false; }
  if( !doc.address.street.length ){ return false; }
  return true;
}

module.exports = function(){

  var stream = through.obj( function( doc, enc, next ) {
    var isNamedPoi = !!doc.getName('default');

    // create a new record for street addresses
    if( hasValidAddress( doc ) ){
      var type = isNamedPoi ? 'poi-address' : 'address';
      var record;

      try {
        // copy data to new document
        record = new Document( 'osmaddress', type + '-' + doc.getType() + '-' + (doc.getId() || ++idOrdinal) )
          .setName( 'default', doc.address.number + ' ' + doc.address.street )
          .setCentroid( doc.getCentroid() );

        [ 'name', 'number', 'street', 'zip' ].forEach( function ( prop ){
          try {
            record.setAddress( prop, doc.getAddress( prop ) );
          } catch ( ex ) {}
        });

        try {
          record.setAlpha3( doc.getAlpha3() );
        } catch ( ex ) {}

        [
          'admin0', 'admin1', 'admin1_abbr', 'admin2', 'local_admin',
          'locality', 'neighborhood'
        ].forEach( function ( level ){
          try {
            record.setAdmin( level, doc.getAdmin( level ) );
          } catch ( ex ) {}
        });
      }
      catch( e ){
        peliasLogger.error( 'address_extractor error' );
        peliasLogger.error( e.stack );
        peliasLogger.error( JSON.stringify( doc, null, 2 ) );
      }

      if( record !== undefined ){
        // copy meta data (but maintain the id & type assigned above)
        record._meta = extend( true, {}, doc._meta, { id: record.getId(), type: record.getType() } );
        this.push( record );
      }
    }

    // forward doc downstream is it's a POI in it's own right
    // note: this MUST be below the address push()
    if( isNamedPoi ){
      this.push( doc );
    }

    return next();

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};

// export for testing
module.exports.hasValidAddress = hasValidAddress;
