var combinedStream = require('combined-stream');
var pbf = require('./pbf');
var path = require('path');

function createCombinedStream(){
  var fullStream = combinedStream.create();
  var defaultPath= require('pelias-config').generate().imports.openstreetmap;

  defaultPath.import.forEach(function( importObject){
    var conf = {file: path.join(defaultPath.datapath, importObject.filename), leveldb: defaultPath.leveldbpath};
    fullStream.append(function(next){
      console.log('Creating read stream for: ' + conf.file);
      next(pbf.parser(conf));
    });
  });

  return fullStream;
}

module.exports.create = createCombinedStream;
