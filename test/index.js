
var osm = require('../index');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: osm.pbf.parser', function(t) {
    t.equal(typeof osm.pbf.parser, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.doc.mapper', function(t) {
    t.equal(typeof osm.doc.mapper, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.doc.denormalizer', function(t) {
    t.equal(typeof osm.doc.denormalizer, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.address.extractor', function(t) {
    t.equal(typeof osm.address.extractor, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.util.dbmapper', function(t) {
    t.equal(typeof osm.util.dbmapper, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.util.stats', function(t) {
    t.equal(typeof osm.util.stats, 'object', 'stats singleton');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('index: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};