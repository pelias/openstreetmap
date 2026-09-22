const peliasConfig = require('pelias-config').generate(require('./schema'));
const _ = require('lodash');
const logger = require('pelias-logger').get('openstreetmap');

if (_.has(peliasConfig, 'imports.openstreetmap.adminLookup')) {
  logger.info('imports.openstreetmap.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const importPipeline = require('./stream/importPipeline');

// a parallelism greater than one runs a single pbf2json reader which fans its
// output out to that many worker processes, each running the full pipeline
const parallelism = _.get(peliasConfig, 'imports.openstreetmap.parallelism', 1);

if (parallelism > 1) {
  require('./parallel/dispatcher').run(parallelism);
} else {
  importPipeline.import();
}
