'use strict';

const _ = require('lodash');
const async = require('async');
const child_process = require('child_process');
const fs = require('fs-extra');
const config = require( 'pelias-config' ).generate(require('../schema'));
const logger = require('pelias-logger').get('download');

if (require.main === module) {
  download((err) => {
    if (err) {
      logger.error('Failed to download data', err);
      process.exit(1);
    }
    logger.info('All done!');
  });
}

function download(callback) {
  let sources;

  // if no download sources are specified, default to the planet file
  if (_.isEmpty(config.imports.openstreetmap.download)) {
    sources = [
      'https://planet.openstreetmap.org/pbf/planet-latest.osm.pbf'
    ];
  }
  else {
    sources = _.map(config.imports.openstreetmap.download, (source) => source.sourceURL);
  }

  logger.info(`Downloading sources: ${sources}`);

  fs.ensureDir(config.imports.openstreetmap.datapath, (err) => {
    if (err) {
      logger.error(`error making directory ${config.imports.openstreetmap.datapath}`, err);
      return callback(err);
    }

    async.forEach(
      sources,
      (source, next) => {
        downloadSource(config, source, next);
      },
      callback
    );
  });
}

function downloadSource(config, sourceUrl, callback) {
  const targetDir = config.imports.openstreetmap.datapath;

  logger.debug(`downloading ${sourceUrl} to ${targetDir}`);
  child_process.exec(`cd ${targetDir} && { curl -L -X GET --silent --fail --remote-name ${sourceUrl}; }`, callback);
}

module.exports = download;
