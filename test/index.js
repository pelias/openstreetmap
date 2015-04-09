
var osm = require('../index'),
    isObject = require('is-object');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: osm.pbf.parser', function(t) {
    t.equal(typeof osm.pbf.parser, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.tag.mapper', function(t) {
    t.equal(typeof osm.tag.mapper, 'function', 'stream factory');
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
  test('interface: osm.category.mapper', function(t) {
    t.equal(typeof osm.category.mapper, 'function', 'stream factory');
    t.end();
  });
  test('interface: osm.category.defaults', function(t) {
    t.true(isObject( osm.category.defaults ), 'default mapping object');
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