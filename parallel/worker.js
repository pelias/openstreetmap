'use strict';

/**
  A single import pipeline reading newline delimited JSON from stdin instead of
  spawning its own pbf2json reader. Spawned by the dispatcher, never run directly.
**/

const logger = require('pelias-logger').get('openstreetmap');
const importPipeline = require('../stream/importPipeline');
const ndjson = require('./ndjson');

const id = process.env.PELIAS_OSM_WORKER_ID || '0';
const source = ndjson.create();

logger.info(`import worker ${id} ready`);

source.on('error', (err) => {
  logger.error(`worker ${id} failed to decode input: ${err.message}`);
  process.exit(1);
});

process.stdin.pipe(source);
importPipeline.import(source, `openstreetmap-${id}`);
