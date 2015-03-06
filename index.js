
var elasticsearch = require('pelias-dbclient'),
    adminLookup = require('pelias-admin-lookup'),
    suggester = require('pelias-suggester-pipeline');

var osm = { doc: {}, address: {}, tag: {}, util: {} };
exports = module.exports = osm;

osm.pbf = require('./stream/pbf');
osm.doc.constructor = require('./stream/document_constructor');
osm.doc.denormalizer = require('./stream/denormalizer');
osm.tag.mapper = require('./stream/tag_mapper');
osm.address.extractor = require('./stream/address_extractor');
osm.util.dbmapper = require('./stream/dbmapper');
osm.util.stats = require('./stream/stats');

// default import pipeline
osm.import = function(opts){
  osm.pbf.parser(opts)
    .pipe( osm.doc.constructor() )
    .pipe( osm.tag.mapper() )
    .pipe( osm.doc.denormalizer() )
    // .pipe( adminLookup.stream() )
    .pipe( osm.address.extractor() )
    .pipe( suggester.pipeline )
    .pipe( osm.util.dbmapper() )
    .pipe( elasticsearch() );
};

// run import if executed directly; but not if imported via require()
if( require.main === module ){
  osm.import();
}