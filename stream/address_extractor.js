
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

var through = require('through2');
var isObject = require('is-object');
var extend = require('extend');
var peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );
var Document = require('pelias-model').Document;
var config = require('pelias-config').generate().api;

function hasValidAddress( doc ){
  if( !isObject( doc ) ){ return false; }
  if( !isObject( doc.address_parts ) ){ return false; }
  if( 'string' !== typeof doc.address_parts.number ){ return false; }
  if( 'string' !== typeof doc.address_parts.street ){ return false; }
  if( !doc.address_parts.number.length ){ return false; }
  if( !doc.address_parts.street.length ){ return false; }
  return true;
}

var languages;
if (Array.isArray(config.languages) && config.languages.length>0) {
  languages = config.languages;
}

function hasValidName( doc ){
  if(languages) {
    for(var lang in languages) {
      if (doc.getName(languages[lang])) {
        return true;
      }
    }
  } else {
    return !!doc.getName('default') ;
  }

  return false;
}

module.exports = function(){

  var stream = through.obj( function( doc, enc, next ) {
    var isNamedPoi = hasValidName( doc );
    var isAddress = hasValidAddress( doc );

    // create a new record for street addresses
    if( isAddress ){
      var record;

      // accept semi-colon delimited house numbers
      // ref: https://github.com/pelias/openstreetmap/issues/21
      var streetnumbers = doc.address_parts.number.split(';').map(Function.prototype.call, String.prototype.trim);
      streetnumbers.forEach( function( streetno, i ){

        try {
          var newid = [ doc.getSourceId() ];
          if( i > 0 ){
            newid.push( streetno );
            peliasLogger.debug('[address_extractor] found multiple house numbers: ', streetnumbers);
          }

          // copy data to new document
          record = new Document( 'openstreetmap', 'address', newid.join(':') )
            .setName( 'default', streetno + ' ' + doc.address_parts.street )
            .setCentroid( doc.getCentroid() );

          setProperties( record, doc );
        }

        catch( e ){
          peliasLogger.error( 'address_extractor error' );
          peliasLogger.error( e.stack );
          peliasLogger.error( JSON.stringify( doc, null, 2 ) );
        }

        if( record !== undefined ){
          // copy meta data (but maintain the id & type assigned above)
          record._meta = extend( true, {}, doc._meta, { id: record.getId(), type: record.getType() } );

          // multilang support for addresses
          var tags = doc.getMeta('tags');
          for( var tag in tags ) {
            var suffix = getStreetSuffix(tag);
            if (suffix ) {
              record.setName(suffix, streetno + ' ' + tags[tag] );
            }
          }
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
      this.push( doc );
    }

    if ( isAddress && isNamedPoi ) {
      peliasLogger.verbose('[address_extractor] duplicating a venue with address');
    }
    else if ( !isAddress && !isNamedPoi ) {
      peliasLogger.error('[address_extractor] Invalid doc not pushed downstream: ', JSON.stringify( doc, null, 2 ));
    }

    return next();

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};

// properties to map from the osm record to the pelias doc
var addrProps = [ 'name', 'number', 'street', 'zip' ];

// call document setters and ignore non-fatal errors
function setProperties( record, doc ){
  addrProps.forEach( function ( prop ){
    try {
      record.setAddress( prop, doc.getAddress( prop ) );
    } catch ( ex ) {}
  });
}


function getStreetSuffix( tag ){
  if( tag.length < 6 || tag.substr(0,12) !== 'addr:street:' ){
    return false;
  }
  // normalize suffix
  var suffix = tag.substr(12).toLowerCase();

  if (languages && languages.indexOf(suffix) === -1) { // not interested in this name version
    return false;
  }

  return suffix;
}

// export for testing
module.exports.hasValidAddress = hasValidAddress;
