
/**
  The openstreetmap importer provides a way of parsing, mapping and
  augmenting OSM data in to elasticsearch.
**/

var elasticsearch = require('pelias-dbclient'),
    adminLookup = require('pelias-admin-lookup'),
    suggester = require('pelias-suggester-pipeline'),
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

var through = require('through2');

// default import pipeline
osm.import = function(opts){
  var pipeline = osm.pbf.parser(opts)
    .pipe( osm.doc.constructor() )
    .pipe( osm.tag.mapper() )
    .pipe( osm.doc.denormalizer() );

  if( peliasConfig.imports.openstreetmap.adminLookup ){
    pipeline = pipeline.pipe( adminLookup.stream() );
  }

  pipeline
    .pipe( osm.address.extractor() )
    // .pipe( suggester.pipeline )
    .pipe( osm.category.mapper( osm.category.defaults ) )
    .pipe( through.obj( function( doc, enc, next ){
      doc.shingle = doc.name;
      this.push( doc );
      next();
    }))
    .pipe( dbmapper() )
    .pipe( elasticsearch() );
};

// run import if executed directly; but not if imported via require()
if( require.main === module ){
  osm.import();
}

module.exports = osm;
