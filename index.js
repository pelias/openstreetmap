var peliasConfig = require('pelias-config').generate();
require('./configValidation').validate(peliasConfig);

var importPipeline = require('./stream/importPipeline');

importPipeline.import();
