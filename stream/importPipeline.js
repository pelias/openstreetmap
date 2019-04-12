var categoryDefaults = require('../config/category_map');
var venueNormalizations = require('../config/venue_normalization');

var streams = {};

streams.config = {
  categoryDefaults: categoryDefaults,
  venueNormalizations: venueNormalizations
};

streams.pbfParser = require('./multiple_pbfs').create;
streams.docConstructor = require('./document_constructor');
streams.blacklistStream = require('pelias-blacklist-stream');
streams.tagMapper = require('./tag_mapper');
streams.adminLookup = require('pelias-wof-admin-lookup').create;
streams.addressExtractor = require('./address_extractor');
streams.categoryMapper = require('./category_mapper');
streams.venueNormalization = require('./venue_normalization');
streams.dbMapper = require('pelias-model').createDocumentMapperStream;
streams.elasticsearch = require('pelias-dbclient');

// default import pipeline
streams.import = function(){
  streams.pbfParser()
    .pipe( streams.docConstructor() )
    .pipe( streams.tagMapper() )
    .pipe( streams.addressExtractor() )
    .pipe( streams.blacklistStream() )
    .pipe( streams.categoryMapper( categoryDefaults ) )
    .pipe( streams.venueNormalization( venueNormalizations ) )
    .pipe( streams.adminLookup() )
    .pipe( streams.dbMapper() )
    .pipe( streams.elasticsearch({name: 'openstreetmap'}) );
};

module.exports = streams;