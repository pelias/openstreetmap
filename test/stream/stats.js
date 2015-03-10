
var stats = require('../../stream/stats'),
    through = require('through2');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface: stats', function(t) {
    t.equal(typeof stats, 'object', 'stats instance');
    t.equal(typeof stats.proxy, 'function', 'stream factory');
    t.end();
  });
};

module.exports.tests.reset = function(test, common) {
  test('reset metrics', function(t) {
    stats.metrics = { 'foo': 'bar' };
    stats.reset();
    t.deepEqual(stats.metrics, {}, 'reset metrics');
    t.end();
  });
};

module.exports.tests.proxyCreate = function(test, common) {
  test('create proxy: init metric', function(t) {
    stats.reset();
    var proxy = stats.proxy('title1');
    t.deepEqual(stats.metrics, { title1: 0 }, 'metric initialized');
    t.end();
  });
  test('create proxy: return stream', function(t) {
    stats.reset();
    var s = stats.proxy('title');
    t.equal(typeof s, 'object', 'valid stream');
    t.equal(typeof s._read, 'function', 'valid readable');
    t.equal(typeof s._write, 'function', 'valid writeable');
    t.end();
  });
};

module.exports.tests.proxyRecordStats = function(test, common) {
  test('proxy: record stats', function(t) {
    stats.reset();
    var s = stats.proxy('title2');
    s.write('a');
    s.write('a');
    s.write('a');
    t.deepEqual(stats.metrics, { title2: 3 }, 'track xform ops');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('stats: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};