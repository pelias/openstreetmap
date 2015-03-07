
/**
  The openstreetmap importer provides a way of parsing, mapping and
  augmenting OSM data in to elasticsearch.
**/

var elasticsearch = require('pelias-dbclient'),
    adminLookup = require('pelias-admin-lookup'),
    suggester = require('pelias-suggester-pipeline'),
    dbmapper = require('./stream/dbmapper');

var osm = { pbf: {}, doc: {}, address: {}, tag: {} };
exports = module.exports = osm;

osm.pbf.parser = require('./stream/pbf').parser;
osm.doc.constructor = require('./stream/document_constructor');
osm.doc.denormalizer = require('./stream/denormalizer');
osm.tag.mapper = require('./stream/tag_mapper');
osm.address.extractor = require('./stream/address_extractor');

// default import pipeline
osm.import = function(opts){
  osm.pbf.parser(opts)
    .pipe( osm.doc.constructor() )
    .pipe( osm.tag.mapper() )
    .pipe( osm.doc.denormalizer() )
    .pipe( adminLookup.stream() )
    .pipe( osm.address.extractor() )
    .pipe( suggester.pipeline )
    .pipe( dbmapper() )
    .pipe( elasticsearch() );
};

// run import if executed directly; but not if imported via require()
if( require.main === module ){
  osm.import();
}