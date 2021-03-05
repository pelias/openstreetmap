const through = require('through2');
const mapper = require('../../stream/popularity_mapper');
const ixtures = require('../fixtures/docs');
const Document = require('pelias-model').Document;
const proxyquire = require('proxyquire');
const peliasConfig = require('pelias-config');

function mapper_with_removal_enabled() {
  const customConfig = {
    imports: {
      openstreetmap: {
        removeDisusedVenues: true
      }
    }
  };

  const configWithCustomSettings = {
    generate: function() {
      return peliasConfig.generateCustom(customConfig);
    }
  };
  return proxyquire('../../stream/popularity_mapper', {
    'pelias-config': configWithCustomSettings
  });
}

module.exports.tests = {};

// test exports
module.exports.tests.interface = function (test, common) {
  test('interface: factory', t => {
    t.equal(typeof mapper, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', t => {
    var stream = mapper();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    t.end();
  });
};

// ===================== popularity mapping ======================

module.exports.tests.importance_international = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'importance': 'international' });
  test('maps - importance_international', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 50000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.importance_national = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'importance': 'national' });
  test('maps - importance_national', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 10000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.wikidata = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'wikidata': 'Q1371018' });
  test('maps - wikidata', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 3000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.wikipedia = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'wikipedia': 'it:Aeroporto di Perugia' });
  test('maps - wikipedia', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 3000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.building_hospital = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'building': 'hospital' });
  test('maps - building:hospital', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 2000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.tourism_aquarium = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'tourism': 'aquarium' });
  test('maps - tourism:aquarium', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 3000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.amenity_post_office = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'amenity': 'post_office' });
  test('maps - amenity:post_office', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 1000, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.contact_phone = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'contact:phone': '555-5555' });
  test('maps - contact:phone', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 200, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== transportation ======================

module.exports.tests.international_airport = function(test, common) {
  var doc = new Document('a','venue',1);
  doc.setMeta('tags', { 'aerodrome': 'international', 'iata': 'JFK' });
  test('alias - international airport', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.getPopularity(), 15000);
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.regional_airport = function (test, common) {
  var doc = new Document('a', 'venue', 1);
  doc.setMeta('tags', { 'aerodrome': 'regional', 'iata': 'None' });
  test('alias - regional airport (invalid IATA code)', function (t) {
    var stream = mapper();
    stream.pipe(through.obj(function (doc, enc, next) {
      t.deepEqual(doc.getPopularity(), 5000);
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.railway_station = function (test, common) {
  var doc = new Document('a', 'venue', 1);
  doc.setMeta('tags', { 'railway': 'station' });
  test('alias - railway station', function (t) {
    var stream = mapper();
    stream.pipe(through.obj(function (doc, enc, next) {
      t.deepEqual(doc.getPopularity(), 2000);
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== do not map non-venue docs ======================

module.exports.tests.nonvenue = function (test, common) {
  var doc = new Document('osm', 'street', 1);
  doc.setMeta('tags', { 'importance': 'international' });
  test('does not map - non-venue', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.false(doc.getPopularity(), 'no mapping performed');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== maps address docs ======================
// note: currently 1000 is the hard maximum popularity for addresses
// this restriction may be lifted in the future.

module.exports.tests.address = function (test, common) {
  var doc = new Document('osm', 'address', 1);
  doc.setMeta('tags', { 'importance': 'international' });
  test('does not map - non-venue', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getPopularity(), 1000);
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== discard disused places ======================

module.exports.tests.disused = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'disused:amenity': 'yes' });
  test('does not map - disused', t => {
    var stream = mapper_with_removal_enabled()();
    var counter = 0;
    stream.pipe(through.obj((doc, enc, next) => {
      counter++;
      next();
    }, (done) => {
      t.equal(counter, 0, 'document discarded');
      t.end(); // test will fail if not called (or called twice).
      done();
    }));
    stream.write(doc);
    stream.end();
  });
};

// ===================== discard abandoned places ======================

module.exports.tests.abandoned = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'abandoned:amenity': 'yes' });
  test('does not map - abandoned, removal disabled', t => {
    var stream = mapper();
    var counter = 0;
    stream.pipe(through.obj((doc, enc, next) => {
      counter++;
      next();
    }, (done) => {
      t.equal(counter, 1, 'document NOT discarded');
      t.end(); // test will fail if not called (or called twice).
      done();
    }));
    stream.write(doc);
    stream.end();
  });

  test('does not map - abandoned, removal enabled', t => {
    var stream = mapper_with_removal_enabled()();
    var counter = 0;
    stream.pipe(through.obj((doc, enc, next) => {
      counter++;
      next();
    }, (done) => {
      t.equal(counter, 0, 'document discarded');
      t.end(); // test will fail if not called (or called twice).
      done();
    }));
    stream.write(doc);
    stream.end();
  });
};

module.exports.tests.abandoned_amenity_place_of_worship = function (test, common) {
  var doc = new Document('osm', 'venue', 1);
  doc.setMeta('tags', { 'abandoned:amenity': 'place_of_worship', 'tourism': 'attraction' });
  test('does not map negative value for - abandoned:amenity=place_of_worship', t => {
    var stream = mapper();
    stream.pipe(through.obj(function (doc, enc, next) {
      t.deepEqual(doc.getPopularity(), 2000);
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ======================= errors ========================

// catch general errors in the stream, emit logs and passthrough the doc
module.exports.tests.catch_thrown_errors = function (test, common) {
  test('errors - catch thrown errors', t => {
    var doc = new Document('osm', 'venue', 1);

    // this method will throw a generic Error for testing
    doc.getMeta = function () { throw new Error('test'); };

    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getLayer(), 'venue', 'doc passthrough');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('popularity_mapper: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
