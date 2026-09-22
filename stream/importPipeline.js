var categoryDefaults = require('../config/category_map');

var streams = {};

streams.config = {
  categoryDefaults: categoryDefaults
};

streams.pbfParser = require('./multiple_pbfs').create;
streams.docConstructor = require('./document_constructor');
streams.blacklistStream = require('pelias-blacklist-stream');
streams.tagMapper = require('./tag_mapper');
streams.addressesWithoutStreet = require('./addresses_without_street');
streams.adminLookup = require('pelias-wof-admin-lookup').create;
streams.addressExtractor = require('./address_extractor');
streams.venueFilter = require('./venueFilter');
streams.categoryMapper = require('./category_mapper');
streams.addendumMapper = require('./addendum_mapper');
streams.popularityMapper = require('./popularity_mapper');
streams.dbMapper = require('pelias-model').createDocumentMapperStream;
streams.elasticsearch = require('pelias-dbclient');

// default import pipeline
// source and name are only supplied by the parallel dispatcher's workers, which
// read pbf2json output from stdin rather than parsing a pbf themselves, and name
// themselves individually so dbclient stats and output files stay separable
streams.import = function(source, name){
  ( source || streams.pbfParser() )
    .pipe( streams.docConstructor() )
    .pipe( streams.addressesWithoutStreet() )
    .pipe( streams.tagMapper() )
    .pipe( streams.addressExtractor() )
    .pipe( streams.venueFilter() )
    .pipe( streams.blacklistStream() )
    .pipe( streams.categoryMapper( categoryDefaults ) )
    .pipe( streams.addendumMapper() )
    .pipe( streams.popularityMapper() )
    .pipe( streams.adminLookup() )
    .pipe( streams.dbMapper() )
    .pipe( streams.elasticsearch({name: name || 'openstreetmap'}) );
};

module.exports = streams;
