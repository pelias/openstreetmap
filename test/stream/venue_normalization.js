
var through = require('through2'),
    mapper = require('../../stream/venue_normalization'),
    fixtures = require('../fixtures/docs'),
    Document = require('pelias-model').Document,
    defaultMapping = require('../../config/venue_normalization');

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

module.exports.tests.no_name = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'railway': 'station' } );
  test('maps - no name', function(t) {
    var stream = mapper( [{'conditions': [['railway', 'station']], 'synonyms': ['station'],'suffix': 'railway station'}] );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.name, {}, 'no name passed through');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== feature mapping ======================

module.exports.tests.no_suffix = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setName( 'default', 'test' );
  doc.setMeta( 'tags', { 'railway': 'station' } );
  test('maps - no suffix', function(t) {
    var stream = mapper( [{'conditions': [['railway', 'station']], 'synonyms': ['station'],'suffix': 'railway station'}] );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.name, { 'default': [ 'test', 'test railway station' ] }, 'correctly aliased');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.with_suffix = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setName( 'default', 'test station' );
  doc.setMeta( 'tags', { 'railway': 'station' } );
  test('maps - with suffix', function(t) {
    var stream = mapper( [{'conditions': [['railway', 'station']], 'synonyms': ['station'],'suffix': 'railway station'}] );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.name, { 'default': [ 'test station', 'test railway station' ] }, 'correctly aliased');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('venue_normalization: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
