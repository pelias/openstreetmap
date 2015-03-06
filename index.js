
var elasticsearch = require('pelias-dbclient'),
    adminLookup = require('pelias-admin-lookup'),
    suggester = require('pelias-suggester-pipeline');

var osm = { doc: {}, address: {}, util: {} };
exports = module.exports = osm;

osm.pbf = require('./stream/pbf');
osm.doc.mapper = require('./stream/osm_mapper');
osm.doc.denormalizer = require('./stream/denormalizer');
osm.address.extractor = require('./stream/address_extractor');
osm.util.dbmapper = require('./stream/dbmapper');
osm.util.stats = require('./stream/stats');

// default import pipeline
osm.import = function(opts){
  osm.pbf.parser(opts)
    .pipe( osm.doc.mapper() )
    .pipe( osm.doc.denormalizer() )
    .pipe( adminLookup.stream() )
    .pipe( osm.address.extractor() )
    .pipe( suggester.pipeline )
    .pipe( osm.util.dbmapper() )
    .pipe( elasticsearch() );
};

// run import if executed directly; but not if imported via require()
if( require.main === module ){
  osm.import();
}