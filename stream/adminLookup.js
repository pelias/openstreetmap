var through = require('through2');
var peliasConfig = require( 'pelias-config' ).generate();
var wofAdminLookup = require('pelias-wof-admin-lookup');


function sendPassthroughStream() {
  return through.obj(function (doc, enc, next) {
    next(null, doc);
  });
}

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

  // admin lookup disabled
  if (!config.imports.openstreetmap.adminLookup) {
    return sendPassthroughStream();
  }

  // admin lookup enabled
  if (config.imports.adminLookup && config.imports.adminLookup.url) {
    //var pipResolver = adminLookup.createWofPipResolver(config.imports.adminLookup.url);
    var pipResolver = adminLookup.createLocalWofPipResolver();
    return adminLookup.createLookupStream(pipResolver);
  }

  // throw error if flag is set but no URL configured
  var message = 'Admin lookup is enabled but no url is specified in your config ' +
    'at imports.adminLookup.url. Make sure a URL pointing to a Who\'s on First point ' +
    'in polygon server (https://github.com/whosonfirst/go-whosonfirst-pip) is set in your config';
  throw new Error(message);
}

module.exports = createStream;
