var peliasConfig = require( 'pelias-config' ).generate();
var adminLookup = require('pelias-wof-admin-lookup');

function createStream() {
  if (peliasConfig.imports.openstreetmap.adminLookup) {
    var pipResolver = adminLookup.createWofPipResolver(peliasConfig.imports.adminLookup.url);
    return adminLookup.createLookupStream(pipResolver);
  }
  else {
    return through.obj(function (doc, enc, next) {
      next(null, doc);
    });
  }
}

module.exports = createStream;
