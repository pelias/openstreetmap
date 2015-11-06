
/**
  The openstreetmap importer provides a way of parsing, mapping and
  augmenting OSM data in to elasticsearch.
**/

var elasticsearch = require('pelias-dbclient'),
    addressDedupStream = require( 'pelias-address-deduplicator' );
    adminLookup = require('pelias-admin-lookup'),
    dbmapper = require('./stream/dbmapper'),
    peliasConfig = require( 'pelias-config' ).generate();

var osm = { pbf: {}, doc: {}, address: {}, tag: {}, category: {} };

osm.pbf.parser = require('./stream/pbf').parser;
osm.doc.constructor = require('./stream/document_constructor');
osm.doc.denormalizer = require('./stream/denormalizer');
osm.tag.mapper = require('./stream/tag_mapper');
osm.address.extractor = require('./stream/address_extractor');
osm.category.mapper = require('./stream/category_mapper');
osm.category.defaults = require('./config/category_map');

// default import pipeline
osm.import = function(opts){
  var pipeline = osm.pbf.parser(opts)
    .pipe( osm.doc.constructor() )
    .pipe( osm.tag.mapper() )
    .pipe( osm.doc.denormalizer() );

  if( peliasConfig.imports.openstreetmap.adminLookup ){
    pipeline = pipeline.pipe( adminLookup.stream() );
  }

  pipeline = pipeline.pipe( osm.address.extractor() );
  
  if( peliasConfig.imports.openstreetmap.deduplicate ){
    pipeline = pipeline.pipe( addressDedupStream() );
  }
  
  pipeline
    .pipe( osm.category.mapper( osm.category.defaults ) )
    .pipe( dbmapper() )
    .pipe( elasticsearch() );
};

// run import if executed directly; but not if imported via require()
if( require.main === module ){
  osm.import();
}

module.exports = osm;
