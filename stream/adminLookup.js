var through = require('through2');
var peliasConfig = require( 'pelias-config' ).generate();
var wofAdminLookup = require('pelias-wof-admin-lookup');
var sendPassthroughStream = require('../util/sendPassthroughStream');

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

  // disable adminLookup with empty config
  if (!config.imports || !config.imports.openstreetmap) {
    return sendPassthroughStream();
  }

  // admin lookup enabled
  if (config.imports.openstreetmap.adminLookup) {
    var pipResolver = adminLookup.createLocalWofPipResolver();
    return adminLookup.createLookupStream(pipResolver);
  } else {
    return sendPassthroughStream();
  }
}

module.exports = createStream;
