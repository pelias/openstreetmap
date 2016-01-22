var through = require('through2');
var peliasConfig = require( 'pelias-config' ).generate();
var wofAdminLookup = require('pelias-wof-admin-lookup');

/**
 * Generate a stream object that will handle the adminLookup when enabled.
 * When disabled, generate a passthrough stream.
 *
 * @param {object} [config]
 * @param {object} [adminLookup]
 * @returns {Stream}
 */
function createStream(config, adminLookup) {
  config = config || peliasConfig;
  adminLookup = adminLookup || wofAdminLookup;

  if (config.imports.openstreetmap.adminLookup) {
    var pipResolver = adminLookup.createWofPipResolver(config.imports.adminLookup.url);
    return adminLookup.createLookupStream(pipResolver);
  }
  else {
    return through.obj(function (doc, enc, next) {
      next(null, doc);
    });
  }
}

module.exports = createStream;
