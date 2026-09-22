'use strict';

/**
  Chooses how to read a configured OSM source file.

  A .pbf is parsed by pbf2json, which first builds a leveldb cache of node
  positions. That cache is the slowest part of an OSM import - hours for a
  planet file - and its output is deterministic, so it is often produced once
  and stored.

  A .ndjson, .ldjson or .jsonl file is assumed to be exactly that: the newline
  delimited output of a previous pbf2json run. It is read directly, skipping
  both the parse and the cache build. Since that output is usually kept
  compressed, a .gz suffix is decompressed on the way through.
**/

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');
const pbf = require('./pbf');
const ndjson = require('../parallel/ndjson');
const logger = require('pelias-logger').get('openstreetmap');

const JSON_EXTENSIONS = ['.ndjson', '.ldjson', '.jsonl'];
const GZIP_EXTENSION = '.gz';

function isCompressed(file) {
  return path.extname(file || '').toLowerCase() === GZIP_EXTENSION;
}

// the name without its compression suffix, so 'planet.jsonl.gz' is recognised
// by the same rule as 'planet.jsonl'
function uncompressedName(file) {
  return isCompressed(file) ? (file || '').slice(0, -GZIP_EXTENSION.length) : (file || '');
}

/**
 * True when this file holds stored pbf2json output rather than a pbf.
 */
function isJsonSource(file) {
  return JSON_EXTENSIONS.includes(path.extname(uncompressedName(file)).toLowerCase());
}

// options which pbf2json applies while parsing, and which a stored file has
// already been produced with
function warnIgnoredOptions(conf) {
  if (conf.importVenues === false) {
    logger.warn(
      `importVenues is ignored for ${path.basename(conf.file)}: which tags were ` +
      'extracted was decided when the file was generated'
    );
  }
}

/**
 * A stream of OSM record objects, from either source type.
 */
function createRecordStream(conf) {
  if (!isJsonSource(conf.file)) {
    return pbf.parser(conf);
  }

  warnIgnoredOptions(conf);

  // pipeline rather than pipe: a read or decompression failure has to surface
  // on the stream the pipeline is consuming, not be lost upstream
  return pipeline(createByteStream(conf.file), ndjson.create(), () => {});
}

/**
 * The raw newline delimited bytes of a stored file, for the parallel
 * dispatcher: it splits on newlines itself and never parses the json.
 *
 * Decompression, when needed, happens in this process. For a planet sized file
 * that is a few percent of one core spread over the whole import, far less than
 * the pbf parse it replaces.
 */
function createByteStream(file) {
  const raw = fs.createReadStream(file);
  if (!isCompressed(file)) { return raw; }

  // pipeline so the file handle is closed if decompression fails, or if the
  // reader is destroyed when the import is interrupted
  return pipeline(raw, zlib.createGunzip(), () => {});
}

module.exports = {
  isJsonSource: isJsonSource,
  isCompressed: isCompressed,
  createRecordStream: createRecordStream,
  createByteStream: createByteStream
};
