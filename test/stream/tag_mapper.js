
var through = require('through2'),
    mapper = require('../../stream/tag_mapper'),
    fixtures = require('../fixtures/docs'),
    Document = require('pelias-model').Document;

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof mapper, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var stream = mapper();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    t.end();
  });
};

// perform a no-op for docs with no tags (just in case!)
module.exports.tests.passthrough = function(test, common) {
  test('passthrough: no tags', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc, fixtures.osmNode1, 'no-op for docs with no tags' );
      t.deepEqual( doc.name, { node: 'node7' }, 'no name data mapped' );
      t.deepEqual( doc.address_parts, {}, 'no address data mapped' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.osmNode1);
  });
};

// ======================== names =========================

module.exports.tests.localised_names = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name:en': 'test', 'name:es': 'prueba' });
  test('maps - localised names', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('en'), 'test', 'correctly mapped');
      t.equal(doc.getName('es'), 'prueba', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.osm_names = function(test, common) {
  test('maps - default name', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { name: 'test name 1' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'test name 1', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
  test('maps - name schema', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { loc_name: 'test1', nat_name: 'test2' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('local'), 'test1', 'correctly mapped');
      t.equal(doc.getName('national'), 'test2', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// Cover the case of a tag key being 'name:' eg. { 'name:': 'foo' }
// Not to be confused with { 'name': 'foo' } (note the extraneous colon)
module.exports.tests.extraneous_colon = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name:': 'test' });
  test('rejects - extraneous colon', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.name, {}, 'extraneous colon tag ignored');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// Reject the bulk of the free-tagging keys used to mark up data in osm
module.exports.tests.reject_difficult_keys = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name:*': 'test', 'name:ဗမာ': 'test2', 'name:<阪神電鉄>': 'test3' });
  test('rejects - difficult keys', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.name, {}, 'all keys rejected');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// Accept keys from ./config/localized_keys.js
module.exports.tests.accept_localized_keys = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name:ru': 'test1', 'name:pl': 'test2', 'name:ko': 'test3' });
  test('maps - localized keys', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('ru'), 'test1', 'correctly mapped');
      t.equal(doc.getName('pl'), 'test2', 'correctly mapped');
      t.equal(doc.getName('ko'), 'test3', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.lowercase_keys = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name:EN': 'test' });
  test('maps - lowercase keys', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('en'), 'test', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.airport_codes = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name': 'test', 'aerodrome': '', 'iata': 'FOO' });
  test('alias - airport codes', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'test', 'correctly mapped');
      t.deepEqual(doc.getNameAliases('default'), ['FOO', 'FOO Airport'], 'correctly mapped');
      t.deepEqual(doc.getPopularity(), 10000);
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ======================== addresses =========================

module.exports.tests.osm_schema = function(test, common) {
  test('maps - osm schema', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { postal_code: 'AAA' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getAddress('zip'), 'AAA', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.naptan_schema = function(test, common) {
  test('maps - naptan schema', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { 'naptan:Street': 'BBB' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getAddress('street'), 'BBB', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.karlsruhe_schema = function(test, common) {
  test('maps - karlsruhe schema', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { 'addr:housename': 'CCC', 'addr:housenumber': '111' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getAddress('name'), 'CCC', 'correctly mapped');
      t.equal(doc.getAddress('number'), '111', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ======================== data cleansing =========================

module.exports.tests.trim_junk = function(test, common) {
  test('clean - junk chars', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { name: '- \'Round Midnight Jazz and Blues Bar "* ' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'Round Midnight Jazz and Blues Bar', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
  // ref: https://github.com/pelias/openstreetmap/issues/47
  test('clean - preserve brackets', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { name: 'Transportation Center Bus Stop (Coach USA)' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'Transportation Center Bus Stop (Coach USA)', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ======================= errors ========================

// catch general errors in the stream, emit logs and passthrough the doc
module.exports.tests.catch_thrown_errors = function(test, common) {
  test('errors - catch thrown errors', function(t) {
    var doc = new Document('a','b',1);

    // this method will throw a generic Error for testing
    doc.getMeta = function(){ throw new Error('test'); };

    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getType(), 'b', 'doc passthrough' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.empty_tag_value = function(test, common) {
  test('errors - ignore empty tags', function(t) {
    var doc = new Document('a','b',1);
    doc.setMeta('tags', { name: '' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), undefined, 'ignore empty tags');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.tab_only_value = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name': '\t' });
  test('errors - tab only value', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), undefined, 'remove tabs');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.tab_in_value = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name': '\tfoo\t' });
  test('errors - tab in value', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'foo', 'remove tabs');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.newline_only_value = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name': '\n' });
  test('errors - newline only value', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), undefined, 'remove newlines');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.newline_in_value = function(test, common) {
  var doc = new Document('a','b',1);
  doc.setMeta('tags', { 'name': '\nfoo\n' });
  test('errors - newline in value', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'foo', 'remove newlines');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('tag_mapper: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};