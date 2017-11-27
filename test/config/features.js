
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
    t.false( features.indexOf('amenity+name') <0 );
    t.false( features.indexOf('building+name') <0 );
    t.false( features.indexOf('shop+name') <0 );
    t.false( features.indexOf('office+name') <0 );
    t.false( features.indexOf('public_transport+name') <0 );
    t.false( features.indexOf('cuisine+name') <0 );
    t.false( features.indexOf('railway~tram_stop+name') <0 );
    t.false( features.indexOf('railway~station+name') <0 );
    t.false( features.indexOf('railway~halt+name') <0 );
    t.false( features.indexOf('railway~subway_entrance+name') <0 );
    t.false( features.indexOf('railway~train_station_entrance+name') <0 );
    t.false( features.indexOf('sport+name') <0 );
    t.false( features.indexOf('natural+name') <0 );
    t.false( features.indexOf('tourism+name') <0 );
    t.false( features.indexOf('leisure+name') <0 );
    t.false( features.indexOf('historic+name') <0 );
    t.false( features.indexOf('man_made+name') <0 );
    t.false( features.indexOf('landuse+name') <0 );
    t.false( features.indexOf('waterway+name') <0 );
    t.false( features.indexOf('aerialway+name') <0 );
    t.false( features.indexOf('craft+name') <0 );
    t.false( features.indexOf('military+name') <0 );
    t.false( features.indexOf('aeroway~terminal+name') <0 );
    t.false( features.indexOf('aeroway~aerodrome+name') <0 );
    t.false( features.indexOf('aeroway~helipad+name') <0 );
    t.false( features.indexOf('aeroway~airstrip+name') <0 );
    t.false( features.indexOf('aeroway~heliport+name') <0 );
    t.false( features.indexOf('aeroway~areodrome+name') <0 );
    t.false( features.indexOf('aeroway~spaceport+name') <0 );
    t.false( features.indexOf('aeroway~landing_strip+name') <0 );
    t.false( features.indexOf('aeroway~airfield+name') <0 );
    t.false( features.indexOf('aeroway~airport+name') <0 );
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
