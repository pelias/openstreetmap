var path = require('path');
var through = require('through2');
var settings = require('pelias-config').generate();
var features = require('../../config/features');
var proxyquire = require('proxyquire');

var fakeGeneratedConfig = {
  imports: {
    openstreetmap: {
      datapath: 'defaultDataPath',
      leveldbpath: 'defaultLevelDBPath',
      'import': [{
          filename: 'defaultFileName'
      }]
    }
  }
};

var fakeConfig = {
  generate: function fakeGenerate() {
    return fakeGeneratedConfig;
  }
};

module.exports.tests = {};

// Test exports
module.exports.tests.interface = function(test, common) {
  var pbf = require('../../stream/pbf');
  test('interface: config', function(t) {
    t.equal(typeof pbf.config, 'function', 'config function');
    t.end();
  });
  test('interface: parser', function(t) {
    t.equal(typeof pbf.parser, 'function', 'stream factory');
    t.end();
  });
};

// Configuration can be configured, if options are not explicitly
// specified then the defaults are used from your pelias/config
module.exports.tests.config = function(test, common) {
  test('config: load defaults', function(t) {
    var pbf = proxyquire('../../stream/pbf', {'pelias-config': fakeConfig});
    var defaults = pbf.config();
    var expected = {
      file: 'defaultDataPath/defaultFileName',
      leveldb: 'defaultLevelDBPath'
    };
    t.equal(defaults.file, expected.file, 'load from settings');
    t.equal(defaults.leveldb, expected.leveldb, 'load from settings');
    t.end();
  });
};

// Validate configuration options
module.exports.tests.validate = function(test, common) {
  test('validate: pbf path', function(t) {
    var pbf = proxyquire('../../stream/pbf', {'pelias-config': fakeConfig});
    fakeGeneratedConfig.imports.openstreetmap.import[0].filename = 'the/file/does/not/exist.pbf';
    var conf = pbf.config();
    t.throws(function(){
      var stream = pbf.parser(conf);
      stream.kill();
    }, 'failed to stat pbf file: defaultDataPath/the/file/does/not/exist.pbf', 'should fail on missing file');
    t.end();
  });
  test('validate: leveldb path', function(t) {
    var pbf = proxyquire('../../stream/pbf', {'pelias-config': fakeConfig});
    fakeGeneratedConfig.imports.openstreetmap.datapath = '';
    fakeGeneratedConfig.imports.openstreetmap.import[0].filename = 'dev/null';
    fakeGeneratedConfig.imports.openstreetmap.leveldbpath = 'path/doesnt/exist';
    var conf = pbf.config();
    t.throws(function(){
      var stream = pbf.parser(conf);
      stream.kill();
    }, 'failed to stat leveldb path: path/doesnt/exist', 'should fail on invalid leveldb path');
    t.end();
  });
};

//Create a new streaming pbf parser based on your config
module.exports.tests.parser = function(test, common) {
  test('parser: create parser', function(t) {
    var pbf = proxyquire('../../stream/pbf', {'pelias-config': fakeConfig});
    fakeGeneratedConfig.imports.openstreetmap.import[0].filename =  path.resolve(__dirname + '/../vancouver_canada.osm.pbf');
    fakeGeneratedConfig.imports.openstreetmap.leveldbpath = '/tmp';
    var stream = pbf.parser();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    stream.kill();
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('pbf: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
