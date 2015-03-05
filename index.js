
var pbf = require('./stream/pbf')
    suggester = require('pelias-suggester-pipeline'),
    adminLookup = require('pelias-admin-lookup');
    stats = require('./stream/stats'),
    document_mapper = require('./stream/osm_mapper'),
    denormalizer = require('./stream/denormalizer'),
    address_extractor = require('./stream/address_extractor'),
    dbmapper = require('./stream/dbmapper'),
    elasticsearch = require('pelias-dbclient');

// uncomment for stream statistics
// setInterval( console.log.bind(console,stats.metrics), 1000 );

pbf.parser()
  .pipe( stats.proxy('pbf -> doc_mapper') )
  .pipe( document_mapper() )
  .pipe( stats.proxy('doc_mapper -> denormalizer') )
  .pipe( denormalizer() )
  .pipe( stats.proxy('denormalizer -> adminLookup') )
  .pipe( adminLookup.stream() )
  .pipe( stats.proxy('adminLookup -> address_extractor') )
  .pipe( address_extractor() )
  .pipe( stats.proxy('address_extractor -> suggester') )
  .pipe( suggester.pipeline )
  .pipe( stats.proxy('suggester -> dbmapper') )
  .pipe( dbmapper() )
  .pipe( stats.proxy('dbmapper -> elasticsearch') )
  .pipe( elasticsearch() );