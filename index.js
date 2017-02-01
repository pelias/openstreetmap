var peliasConfig = require('pelias-config').generate(require('./schema'));

var importPipeline = require('./stream/importPipeline');

importPipeline.import();
