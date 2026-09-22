var combinedStream = require('combined-stream');
var source = require('./source');
var path = require('path');
var logger = require('pelias-logger').get('openstreetmap');

function createCombinedStream(){
  var fullStream = combinedStream.create();
  var defaultPath= require('pelias-config').generate().imports.openstreetmap;

  defaultPath.import.forEach(function( importObject){
    var conf = {
      file: path.join(defaultPath.datapath, importObject.filename),
      leveldb: defaultPath.leveldbpath,
      importVenues: importObject.importVenues
    };
    fullStream.append(function(next){
      logger.info('Creating read stream for: ' + conf.file);
      next(source.createRecordStream(conf));
    });
  });

  return fullStream;
}

module.exports.create = createCombinedStream;
