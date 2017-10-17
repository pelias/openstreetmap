var logger = require('pelias-logger').get('openstreetmap-points');
var categoryDefaults = require('../config/category_map');

var streams = {};

streams.config = {
  categoryDefaults: categoryDefaults
};

streams.pbfParser = require('./multiple_pbfs').create;
streams.docConstructor = require('./document_constructor');
streams.docDenormalizer = require('./denormalizer');
streams.tagMapper = require('./tag_mapper');
streams.adminLookup = require('pelias-wof-admin-lookup').create;
streams.addressExtractor = require('./address_extractor');
streams.deduper = require('./deduper');
streams.categoryMapper = require('./category_mapper');
streams.dbMapper = require('pelias-model').createDocumentMapperStream;
streams.elasticsearch = require('pelias-dbclient');

// default import pipeline
streams.import = function(){
  streams.pbfParser()
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

module.exports = streams;
