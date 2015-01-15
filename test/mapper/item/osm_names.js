
var osm_names = require('../../../mapper/item/osm_names');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof osm_names, 'function', 'valid function');
    t.equal(osm_names.length, 2, 'accepts x arguments');
    t.end();
  });
};

module.exports.tests.default_name = function(test, common) {
  var record = { name: {} };
  var node = { tags: { name: 'test' } };
  test('maps - default name', function(t) {
    osm_names(node, record); // run mapper
    t.equal(record.name.default, 'test', 'correctly mapped');
    t.end();
  });
};

module.exports.tests.localised_names = function(test, common) {
  var record = { name: {} };
  var node = { tags: { 'name:en': 'test', 'name:es': 'prueba' } };
  test('maps - localised names', function(t) {
    osm_names(node, record); // run mapper
    t.equal(record.name.en, 'test', 'correctly mapped');
    t.equal(record.name.es, 'prueba', 'correctly mapped');
    t.end();
  });
};

module.exports.tests.osm_name_mapper = function(test, common) {
  var record = { name: {} };
  var node = { tags: { loc_name: 'test1', nat_name: 'test2' } };
  test('maps - osm naming schema', function(t) {
    osm_names(node, record); // run mapper
    t.equal(record.name.local, 'test1', 'correctly mapped');
    t.equal(record.name.national, 'test2', 'correctly mapped');
    t.end();
  });
};

module.exports.tests.trim_junk = function(test, common) {
  var record = { name: {} };
  var node = { tags: { name: " 'Round Midnight Jazz and Blues Bar " } };
  test('maps - trim junk', function(t) {
    osm_names(node, record); // run mapper
    t.equal(record.name.default, 'Round Midnight Jazz and Blues Bar', 'correctly mapped');
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