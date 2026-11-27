const { pipeline } = require('stream');
const logger = require('pelias-logger').get('openstreetmap');
var categoryDefaults = require('../config/category_map');

var streams = {};

streams.config = {
  categoryDefaults: categoryDefaults
};

streams.pbfParser = require('./source').createImportStream;
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

function exitOnError( err ){
  if( !err ){ return; }

  // exit explicitly, the dbclient timers and admin lookup workers would
  // otherwise keep a failed import running indefinitely
  logger.error( `import failed: ${err.message}` );
  process.exit( 1 );
}

// default import pipeline
// source and name are only supplied by the parallel dispatcher's workers, which
// read pbf2json output from stdin rather than parsing a pbf themselves, and name
// themselves individually so dbclient stats and output files stay separable
streams.import = function(source, name){
  pipeline(
    source || streams.pbfParser(),
    streams.docConstructor(),
    streams.addressesWithoutStreet(),
    streams.tagMapper(),
    streams.addressExtractor(),
    streams.venueFilter(),
    streams.blacklistStream(),
    streams.categoryMapper( categoryDefaults ),
    streams.addendumMapper(),
    streams.popularityMapper(),
    streams.adminLookup(),
    streams.dbMapper(),
    streams.elasticsearch({name: name || 'openstreetmap'}),
    exitOnError
  );
};

module.exports = streams;
