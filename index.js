const peliasConfig = require('pelias-config').generate(require('./schema'));
const _ = require('lodash');
const logger = require('pelias-logger').get('openstreetmap');

if (_.has(peliasConfig, 'imports.openstreetmap.adminLookup')) {
  logger.info('imports.openstreetmap.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const importPipeline = require('./stream/importPipeline');

importPipeline.import();
