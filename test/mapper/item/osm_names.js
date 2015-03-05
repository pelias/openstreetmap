
var osm_names = require('../../../mapper/item/osm_names'),
    Document = require('pelias-model').Document;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof osm_names, 'function', 'valid function');
    t.equal(osm_names.length, 1, 'accepts x arguments');
    t.end();
  });
};

module.exports.tests.default_name = function(test, common) {
  var doc = new Document('a',1);
  doc.setMeta('tags', { name: 'test name 1' });
  test('maps - default name', function(t) {
    osm_names(doc); // run mapper
    t.equal(doc.name.default, 'test name 1', 'correctly mapped');
    t.end();
  });
};

module.exports.tests.localised_names = function(test, common) {
  var doc = new Document('a',1);
  doc.setMeta('tags', { 'name:en': 'test', 'name:es': 'prueba' });
  test('maps - localised names', function(t) {
    osm_names(doc); // run mapper
    t.equal(doc.name.en, 'test', 'correctly mapped');
    t.equal(doc.name.es, 'prueba', 'correctly mapped');
    t.end();
  });
};

module.exports.tests.osm_name_mapper = function(test, common) {
  var doc = new Document('a',1);
  doc.setMeta('tags', { loc_name: 'test1', nat_name: 'test2' });
  test('maps - osm naming schema', function(t) {
    osm_names(doc); // run mapper
    t.equal(doc.name.local, 'test1', 'correctly mapped');
    t.equal(doc.name.national, 'test2', 'correctly mapped');
    t.end();
  });
};

module.exports.tests.trim_junk = function(test, common) {
  var doc = new Document('a',1);
  doc.setMeta('tags', { name: " 'Round Midnight Jazz and Blues Bar " });
  test('maps - trim junk', function(t) {
    osm_names(doc); // run mapper
    t.equal(doc.name.default, 'Round Midnight Jazz and Blues Bar', 'correctly mapped');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('osm_names: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};