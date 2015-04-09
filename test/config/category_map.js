
var mapping = require('../../config/category_map'),
    isObject = require('is-object');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: category mapping', function(t) {
    t.true(isObject(mapping), 'valid mapping');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('category mapping: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};