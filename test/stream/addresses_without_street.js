
const through = require('through2');
const mapper = require('../../stream/addresses_without_street');
const Document = require('pelias-model').Document;

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

// a tags with missing required extra tag (addr:housenumber)
// should pass through the stream without being modified.
// @ref https://github.com/pelias/openstreetmap/pull/565#issuecomment-1062874227
module.exports.tests.passthrough = function(test, common) {
  test('passthrough: missing addr:housenumber tag', function(t) {
    var original = new Document('a','b', 1);
    original.setMeta('tags', { 'addr:place': 'L14' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.getMeta('tags'), original.getMeta('tags'), 'tags not modified' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(original);
  });
};

// // ======================== addresses =========================

module.exports.tests.karlsruhe_schema = function(test, common) {
  test('maps - karlsruhe schema with filled street', function(t) {
    var doc = new Document('a','b', 1);
    doc.setMeta('tags', { 'addr:street': 'BBB' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      var tags = doc.getMeta('tags');
      t.equal(tags['addr:street'], 'BBB', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
  test('maps - karlsruhe schema with empty street and filled place', function(t) {
    var doc = new Document('a','b', 1);
    doc.setMeta('tags', { 'addr:place': 'L14', 'addr:street': '', 'addr:housenumber': '14' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      var tags = doc.getMeta('tags');
      t.equal(tags['addr:street'], 'L14', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
  test('maps - karlsruhe schema without street and with filled place', function(t) {
    var doc = new Document('a','b', 1);
    doc.setMeta('tags', { 'addr:place': 'L14', 'addr:housenumber': '14' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      var tags = doc.getMeta('tags');
      t.equal(tags['addr:street'], 'L14', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
  test('maps - karlsruhe schema with both street and place', function(t) {
    var doc = new Document('a','b', 1);
    doc.setMeta('tags', { 'addr:place': 'L14', 'addr:street': 'BBB', 'addr:housenumber': '14' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      var tags = doc.getMeta('tags');
      t.equal(tags['addr:street'], 'BBB', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('address_without_street: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
