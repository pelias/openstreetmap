var peliasConfig = require( 'pelias-config' ).generate();
var addressDedupeStream = require( 'pelias-address-deduplicator' );


function createStream() {
  // if deduping is enabled, create the deduper stream
  // otherwise create a passthrough stream that does nothing
  if (peliasConfig.imports.openstreetmap.deduplicate) {
    return addressDedupeStream();
  }
  else {
    return through.obj(function (doc, enc, next) {
      next(null, doc);
    });
  }
}

module.exports = createStream;
