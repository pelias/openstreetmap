const features = require('../../config/features');

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
    t.false( features.tags.includes('aeroway+name') );
    t.false( features.tags.includes('aeroway~gate+name') );
    t.false( features.tags.includes('railway+name') );
    t.false( features.tags.includes('railway~rail+name') );
    t.end();
  });
};

// ensure some tags are included
// we exclude by default tags corresponding to venues
module.exports.tests.whitelist = function(test, common) {
  test('whitelist default tags', function(t) {
    t.true( features.tags.includes('addr:housenumber+addr:street') );
    t.false( features.tags.includes('amenity+name') );
    t.end();
  });
};

// ensure some venue tags are included
module.exports.tests.whitelist_venue_tags = function(test, common) {
  test('whitelist venue tags', function(t) {
    t.true( features.venue_tags.includes('amenity+name') );
    t.true( features.venue_tags.includes('building+name') );
    t.true( features.venue_tags.includes('shop+name') );
    t.true( features.venue_tags.includes('office+name') );
    t.true( features.venue_tags.includes('public_transport+name') );
    t.true( features.venue_tags.includes('cuisine+name') );
    t.true( features.venue_tags.includes('railway~tram_stop+name') );
    t.true( features.venue_tags.includes('railway~station+name') );
    t.true( features.venue_tags.includes('railway~halt+name') );
    t.true( features.venue_tags.includes('railway~subway_entrance+name') );
    t.true( features.venue_tags.includes('railway~train_station_entrance+name') );
    t.true( features.venue_tags.includes('sport+name') );
    t.true( features.venue_tags.includes('natural+name') );
    t.true( features.venue_tags.includes('tourism+name') );
    t.true( features.venue_tags.includes('leisure+name') );
    t.true( features.venue_tags.includes('historic+name') );
    t.true( features.venue_tags.includes('man_made+name') );
    t.true( features.venue_tags.includes('landuse+name') );
    t.true( features.venue_tags.includes('waterway+name') );
    t.true( features.venue_tags.includes('aerialway+name') );
    t.true( features.venue_tags.includes('craft+name') );
    t.true( features.venue_tags.includes('military+name') );
    t.true( features.venue_tags.includes('aeroway~terminal+name') );
    t.true( features.venue_tags.includes('aeroway~aerodrome+name') );
    t.true( features.venue_tags.includes('aeroway~helipad+name') );
    t.true( features.venue_tags.includes('aeroway~airstrip+name') );
    t.true( features.venue_tags.includes('aeroway~heliport+name') );
    t.true( features.venue_tags.includes('aeroway~areodrome+name') );
    t.true( features.venue_tags.includes('aeroway~spaceport+name') );
    t.true( features.venue_tags.includes('aeroway~landing_strip+name') );
    t.true( features.venue_tags.includes('aeroway~airfield+name') );
    t.true( features.venue_tags.includes('aeroway~airport+name') );
    t.true( features.venue_tags.includes('brand+name') );
    t.true( features.venue_tags.includes('healthcare+name') );
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
