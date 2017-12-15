
var features = require('../../config/features');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: features', function(t) {
    t.true(Array.isArray(features), 'valid taglist');
    t.end();
  });
};

// ensure some tags are excluded
module.exports.tests.blacklist = function(test, common) {
  test('blacklist', function(t) {
    // see: https://github.com/pelias/openstreetmap/pull/280
    t.true( features.indexOf('aeroway+name') <0 );
    t.true( features.indexOf('aeroway~gate+name') <0 );
    t.true( features.indexOf('railway+name') <0 );
    t.true( features.indexOf('railway~rail+name') <0 );
    t.end();
  });
};

// ensure some tags are included
module.exports.tests.whitelist = function(test, common) {
  test('whitelist', function(t) {
    t.false( features.indexOf('addr:housenumber+addr:street') <0 );
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('features: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
