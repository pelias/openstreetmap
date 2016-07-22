
var path = require('path'),
    through = require('through2'),
    settings = require('pelias-config').generate(),
    pbf = require('../../stream/pbf'),
    features = require('../../config/features');

module.exports.tests = {};

// Test exports
module.exports.tests.interface = function(test, common) {
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
    var defaults = pbf.config();
    var expected = {
      file: settings.imports.openstreetmap.datapath + '/' + settings.imports.openstreetmap.import[0].filename,
      leveldb: settings.imports.openstreetmap.leveldbpath,
      tags: features
    };
    t.equal(defaults.file, expected.file, 'load from settings');
    t.equal(defaults.leveldb, expected.leveldb, 'load from settings');
    t.deepEqual(defaults.tags, expected.tags, 'load from settings');
    t.end();
  });
  test('config: override pbf path', function(t) {
    var conf = pbf.config({ file: '/tmp/foo' });
    t.equal(conf.file, '/tmp/foo', 'override defaults');
    t.end();
  });
  test('config: override leveldb path', function(t) {
    var conf = pbf.config({ leveldb: '/tmp/foo' });
    t.equal(conf.leveldb, '/tmp/foo', 'override defaults');
    t.end();
  });
  test('config: override tags', function(t) {
    var conf = pbf.config({ tags: ['foo+bar'] });
    t.deepEqual(conf.tags, ['foo+bar'], 'override defaults');
    t.end();
  });
};

// Validate configuration options
module.exports.tests.validate = function(test, common) {
  test('validate: pbf path', function(t) {
    var conf = pbf.config({ file: '/tmp/noexist.pbf' });
    t.throws(function(){
      var stream = pbf.parser(conf);
    });
    t.end();
  });
  test('validate: leveldb path', function(t) {
    var conf = pbf.config({ leveldb: '/tmp/noexist.pbf' });
    t.throws(function(){
      var stream = pbf.parser(conf);
    });
    t.end();
  });
  test('validate: tags', function(t) {
    var conf = pbf.config({ tags: [] });
    t.throws(function(){
      var stream = pbf.parser(conf);
    });
    t.end();
  });
};

// Create a new streaming pbf parser based on your config
module.exports.tests.parser = function(test, common) {
  test('parser: create parser', function(t) {
    var config = { file: path.resolve(__dirname + '/../vancouver_canada.osm.pbf') };
    var stream = pbf.parser(config);
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
