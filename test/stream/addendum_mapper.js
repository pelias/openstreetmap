const through = require('through2');
const mapper = require('../../stream/addendum_mapper');
const ixtures = require('../fixtures/docs');
const Document = require('pelias-model').Document;

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

// ===================== default mapping ======================

module.exports.tests.wheelchair = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'wheelchair': 'true' });
  test('maps - wheelchair', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { wheelchair: 'true' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.iata = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'iata': 'PEG' });
  test('maps - iata', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { iata: 'PEG' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.icao = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'icao': 'LIRZ' });
  test('maps - icao', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { icao: 'LIRZ' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.wikidata = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'wikidata': 'Q1371018' });
  test('maps - wikidata', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { wikidata: 'Q1371018' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.wikipedia = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'wikipedia': 'it:Aeroporto di Perugia' });
  test('maps - wikipedia', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { wikipedia: 'it:Aeroporto di Perugia' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== contact details ======================

module.exports.tests.website = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'website': 'https://example.com' });
  test('maps - website', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { website: 'https://example.com' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.phone = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'phone': '555-5555' });
  test('maps - phone', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { phone: '555-5555' }, 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.opening_hours = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'opening_hours': '24/7' });
  test('maps - opening_hours', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.addendum.osm, { opening_hours: '24/7' }, 'correctly mapped');
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
    var doc = new Document('osm', 'a', 1);

    // this method will throw a generic Error for testing
    doc.getMeta = function () { throw new Error('test'); };

    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.deepEqual(doc.getLayer(), 'a', 'doc passthrough');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.empty_tag_value = function (test, common) {
  test('errors - ignore empty tags', t => {
    var doc = new Document('osm', 'a', 1);
    doc.setMeta('tags', { 'wheelchair': '' });
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.false(doc.addendum.osm, 'ignore empty tags');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.tab_only_value = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'wheelchair': '\t' });
  test('errors - tab only value', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.false(doc.addendum.osm, 'remove tabs');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.newline_only_value = function (test, common) {
  var doc = new Document('osm', 'a', 1);
  doc.setMeta('tags', { 'wheelchair': '\n' });
  test('errors - newline only value', t => {
    var stream = mapper();
    stream.pipe(through.obj((doc, enc, next) => {
      t.false(doc.addendum.osm, 'remove newlines');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('addendum_mapper: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
