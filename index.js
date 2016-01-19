
/**
  The openstreetmap importer provides a way of parsing, mapping and
  augmenting OSM data in to elasticsearch.
**/

var through = require('through2');
var logger = require('pelias-logger').get('openstreetmap');
var categoryDefaults = require('./config/category_map');

var streams = {};

streams.config = {
  categoryDefaults: categoryDefaults
};

streams.pbfParser = require('./stream/pbf').parser;
streams.docConstructor = require('./stream/document_constructor');
streams.docDenormalizer = require('./stream/denormalizer');
streams.tagMapper = require('./stream/tag_mapper');
streams.adminLookup = require('./stream/adminLookup');
streams.addressExtractor = require('./stream/address_extractor');
streams.deduper = require('./stream/deduper');
streams.categoryMapper = require('./stream/category_mapper');
streams.dbMapper = require('./stream/dbmapper');
streams.elasticsearch = require('pelias-dbclient');


// default import pipeline
streams.import = function(opts){
  streams.pbfParser(opts)
    .pipe( streams.docConstructor() )
    .pipe( streams.tagMapper() )
    .pipe( streams.docDenormalizer() )
    .pipe( streams.addressExtractor() )
    .pipe( streams.categoryMapper( categoryDefaults ) )
    .pipe( streams.adminLookup() )
    .pipe( streams.deduper() )
    .pipe( streams.dbMapper() )
    .pipe( streams.elasticsearch() );
};


// run import if executed directly; but not if imported via require()
if( require.main === module ){
  streams.import();
}

module.exports = streams;
