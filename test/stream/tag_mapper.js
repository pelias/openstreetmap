
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
      t.deepEqual( doc.name, { osmnode: 'node7' }, 'no name data mapped' );
      t.deepEqual( doc.address, {}, 'no address data mapped' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.osmNode1);
  });
};

// ======================== names =========================

module.exports.tests.localised_names = function(test, common) {
  var doc = new Document('a',1);
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
    var doc = new Document('a',1);
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
    var doc = new Document('a',1);
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

// ======================== addresses =========================

module.exports.tests.osm_schema = function(test, common) {
  test('maps - osm schema', function(t) {
    var doc = new Document('a',1);
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
    var doc = new Document('a',1);
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
    var doc = new Document('a',1);
    doc.setMeta('tags', { 'addr:housename': 'CCC', 'addr:city': 'DDD' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getAddress('name'), 'CCC', 'correctly mapped');
      t.equal(doc.getAddress('city'), 'DDD', 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ======================== data cleansing =========================

module.exports.tests.trim_junk = function(test, common) {
  test('clean - junk chars', function(t) {
    var doc = new Document('a',1);
    doc.setMeta('tags', { name: '- \'Round Midnight Jazz and Blues Bar "* ' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal(doc.getName('default'), 'Round Midnight Jazz and Blues Bar', 'correctly mapped');
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