const { Readable } = require('stream');
const path = require('path');
const source = require('./source');
const logger = require('pelias-logger').get('openstreetmap');

// each source is only opened once the previous one has been fully read, so
// only a single pbf2json process runs at a time
async function* readSequentially(configs){
  for (const conf of configs) {
    logger.info('Creating read stream for: ' + conf.file);
    yield* source.createRecordStream(conf);
  }
}

function createCombinedStream(){
  const osm = require('pelias-config').generate().imports.openstreetmap;

  const configs = osm.import.map((importObject) => ({
    file: path.join(osm.datapath, importObject.filename),
    leveldb: osm.leveldbpath,
    importVenues: importObject.importVenues
  }));

  return Readable.from(readSequentially(configs));
}

module.exports.create = createCombinedStream;
