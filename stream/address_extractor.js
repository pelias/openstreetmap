
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
  duplicating the data across to the new doc instance while adjusting it's id and layer.

  In a rare case it is possible that the record contains neither a valid name nor a valid
  address. If this case in encountered then the parser should be modified so these records
  are no longer passed down the pipeline; as they will simply be discarded because they are
  not searchable.
**/

const through = require('through2');
const isObject = require('is-object');
const extend = require('extend');
const peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );
const Document = require('pelias-model').Document;
const parseSemicolonDelimitedValues = require('../util/parseSemicolonDelimitedValues');

function hasValidAddress( doc ){
  if( !isObject( doc ) ){ return false; }
  if( !isObject( doc.address_parts ) ){ return false; }
  if( 'string' !== typeof doc.address_parts.number ){ return false; }
  if( 'string' !== typeof doc.address_parts.street ){ return false; }
  if( !doc.address_parts.number.length ){ return false; }
  if( !doc.address_parts.street.length ){ return false; }
  return true;
}

module.exports = function(){

  var stream = through.obj( function( doc, enc, next ) {
    const isNamedPoi = !!doc.getName('default');
    const isAddress = hasValidAddress( doc );

    // accept semi-colon delimited house numbers
    // ref: https://github.com/pelias/openstreetmap/issues/21
    const streetNumbers = parseSemicolonDelimitedValues(doc.getAddress('number'));

    // create a new record for street addresses
    if( isAddress ){
      streetNumbers.forEach( function( streetno, i ){
        let record;

        try {
          const newid = [ doc.getSourceId() ];
          if( i > 0 ){
            newid.push( i );
            peliasLogger.debug('[address_extractor] found multiple house numbers: ', streetNumbers);
          }

          // copy data to new document
          record = new Document( 'openstreetmap', 'address', newid.join('/') )
            .setName( 'default', streetno + ' ' + doc.address_parts.street )
            .setCentroid( doc.getCentroid() );

          // copy all address properties
          setProperties( record, doc );

          // ensure that only a single address number is used
          record.setAddress('number', streetno);
        }

        catch( e ){
          peliasLogger.error( 'address_extractor error' );
          peliasLogger.error( e.stack );
          peliasLogger.error( JSON.stringify( doc, null, 2 ) );
        }

        if( record !== undefined ){
          // copy meta data (but maintain the id assigned above)
          record._meta = extend( true, {}, doc._meta, { id: record.getId() } );
          this.push( record );
        }
        else {
          peliasLogger.error( '[address_extractor] failed to push address downstream' );
        }

      }, this);

    }

    // forward doc downstream if it's a POI in its own right
    // note: this MUST be below the address push()
    if( isNamedPoi ){

      // in the case of multiple house numbers, only use the first one for the venue
      if (streetNumbers.length > 1) {
        doc.setAddress('number', streetNumbers[0]);
      }

      this.push( doc );
    }

    return next();

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};

// properties to map from the osm record to the pelias doc
const addrProps = [ 'name', 'number', 'street', 'zip' ];

// call document setters and ignore non-fatal errors
function setProperties( record, doc ){
  addrProps.forEach( function ( prop ){
    try {
      record.setAddress( prop, doc.getAddress( prop ) );
    } catch ( ex ) {}
  });
}

// export for testing
module.exports.hasValidAddress = hasValidAddress;
