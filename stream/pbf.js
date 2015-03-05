
var fs = require('fs'),
    pbf2json = require('pbf2json'),
    settings = require('pelias-config').generate(),
    features = require('../config/features').features;

// Create a new pbf parser stream
function createPbfStream( opts ){

  var opts = config( opts );

  validatePath( opts.file, 'failed to stat pbf file: ' + opts.file );
  validatePath( opts.leveldb, 'failed to stat leveldb path: ' + opts.leveldb );
  validateTags( opts.tags );

  return pbf2json.createReadStream(opts);
}

// Generate configuration options for pbf2json, apply default
// configurations where not explicitly specified.
function config( opts ){

  opts = opts || {};
  
  // Use datapath setting from your config file
  // @see: github://pelias/config for more info.
  if( !opts.hasOwnProperty('file') ){
    var filename = settings.imports.openstreetmap.import[0].filename;
    opts.file = settings.imports.openstreetmap.datapath + '/' + filename;
  }

  // Use leveldb setting from your config file
  // @see: github://pelias/config for more info.
  if( !opts.hasOwnProperty('leveldb') ){
    opts.leveldb = settings.imports.openstreetmap.leveldbpath;
  }

  // Use default parser tags
  if( !opts.hasOwnProperty('tags') ){
    opts.tags = defaultTags();
  }

  return opts;
}

// Check path exists
function validatePath( path, message ){  
  try {
    fs.statSync( path );
  } catch( e ){
    throw new Error( 'failed to stat pbf file: ' + path );
  }
}

// Check leveldb dir exists
function validateTags( tags ){  
  if( !Array.isArray(tags) || !tags.length ) {
    throw new Error( 'invalid tags' );
  }
}

// Build a list of osm tags we want the parser to target
function defaultTags(){

  // Extract streets
  var tags = ['addr:housenumber+addr:street'];

  // Records with tags in the feature list and also a valid name
  features.forEach( function( feature ){
    tags.push( feature + '+name' );
  });

  return tags;
}

module.exports.config = config;
module.exports.parser = createPbfStream;