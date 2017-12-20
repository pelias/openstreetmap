
var features = require('../../config/features');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: features', function(t) {
    t.true(Array.isArray(features.tags), 'valid taglist');
    t.end();
  });
};

// ensure some tags are excluded
module.exports.tests.blacklist = function(test, common) {
  test('blacklist default tags', function(t) {
    // see: https://github.com/pelias/openstreetmap/pull/280
    t.true( features.tags.indexOf('aeroway+name') <0 );
    t.true( features.tags.indexOf('aeroway~gate+name') <0 );
    t.true( features.tags.indexOf('railway+name') <0 );
    t.true( features.tags.indexOf('railway~rail+name') <0 );
    t.end();
  });
};

// ensure some tags are included
// we exclude by default tags corresponding to venues
module.exports.tests.whitelist = function(test, common) {
  test('whitelist default tags', function(t) {
    t.false( features.tags.indexOf('addr:housenumber+addr:street') <0 );
    t.true( features.venue_tags.indexOf('amenity+name') <0 );
    t.end();
  });
};

// ensure some venue tags are included
module.exports.tests.whitelist = function(test, common) {
  test('whitelist venue tags', function(t) {
    t.false( features.venue_tags.indexOf('amenity+name') <0 );
    t.false( features.venue_tags.indexOf('building+name') <0 );
    t.false( features.venue_tags.indexOf('shop+name') <0 );
    t.false( features.venue_tags.indexOf('office+name') <0 );
    t.false( features.venue_tags.indexOf('public_transport+name') <0 );
    t.false( features.venue_tags.indexOf('cuisine+name') <0 );
    t.false( features.venue_tags.indexOf('railway~tram_stop+name') <0 );
    t.false( features.venue_tags.indexOf('railway~station+name') <0 );
    t.false( features.venue_tags.indexOf('railway~halt+name') <0 );
    t.false( features.venue_tags.indexOf('railway~subway_entrance+name') <0 );
    t.false( features.venue_tags.indexOf('railway~train_station_entrance+name') <0 );
    t.false( features.venue_tags.indexOf('sport+name') <0 );
    t.false( features.venue_tags.indexOf('natural+name') <0 );
    t.false( features.venue_tags.indexOf('tourism+name') <0 );
    t.false( features.venue_tags.indexOf('leisure+name') <0 );
    t.false( features.venue_tags.indexOf('historic+name') <0 );
    t.false( features.venue_tags.indexOf('man_made+name') <0 );
    t.false( features.venue_tags.indexOf('landuse+name') <0 );
    t.false( features.venue_tags.indexOf('waterway+name') <0 );
    t.false( features.venue_tags.indexOf('aerialway+name') <0 );
    t.false( features.venue_tags.indexOf('craft+name') <0 );
    t.false( features.venue_tags.indexOf('military+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~terminal+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~aerodrome+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~helipad+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~airstrip+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~heliport+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~areodrome+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~spaceport+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~landing_strip+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~airfield+name') <0 );
    t.false( features.venue_tags.indexOf('aeroway~airport+name') <0 );
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
