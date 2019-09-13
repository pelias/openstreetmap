
var through = require('through2'),
    mapper = require('../../stream/category_mapper'),
    fixtures = require('../fixtures/docs'),
    Document = require('pelias-model').Document,
    defaultMapping = require('../../config/category_map');

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

// ===================== feature mapping ======================

module.exports.tests.regular_features = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'foo': 'baz' } );
  test('maps - regular features', function(t) {
    var stream = mapper( { 'foo': { 'baz': 'category1' } } );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['category1'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.wildcard_features = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'foo': 'baz' } );
  test('maps - wilcard features', function(t) {
    var stream = mapper( { 'foo': { '*': 'category2' } } );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['category2'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

// ===================== default mapping ======================

module.exports.tests.bakery = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'shop': 'bakery' } );
  test('maps - bakery', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['retail','food'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.biergarten = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'amenity': 'biergarten' } );
  test('maps - biergarten', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['nightlife','food'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.international_airport = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'aeroway': 'international' } );
  test('maps - international airport', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['transport','transport:air','transport:air:airport'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.public_transport = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'public_transport': 'something' } );
  test('maps - public transport', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['transport','transport:public'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.combination_bakery_biergarten = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'shop': 'bakery', 'amenity': 'biergarten' } );
  test('maps - combination bakery biergarten', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['nightlife','food','retail'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.sport_wildcard = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'sport': 'rugby_union' } );
  test('maps - sports inherit recreation via wildcard', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['recreation','entertainment'], 'correctly mapped');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.argentinian_steak_restaurant = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta( 'tags', { 'cuisine': 'argentinian' } );
  test('maps - argentinian steak restaurant', function(t) {
    var stream = mapper( defaultMapping );
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, ['food','food:cuisine:argentinian'], 'correctly mapped');
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
    var doc = new Document('osm','a',1);

    // this method will throw a generic Error for testing
    doc.getMeta = function(){ throw new Error('test'); };

    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getLayer(), 'a', 'doc passthrough' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.empty_tag_value = function(test, common) {
  test('errors - ignore empty tags', function(t) {
    var doc = new Document('osm','a',1);
    doc.setMeta('tags', { 'cuisine': '' });
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, [], 'ignore empty tags');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.tab_only_value = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta('tags', { 'cuisine': '\t' });
  test('errors - tab only value', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, [], 'remove tabs');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.tests.newline_only_value = function(test, common) {
  var doc = new Document('osm','a',1);
  doc.setMeta('tags', { 'cuisine': '\n' });
  test('errors - newline only value', function(t) {
    var stream = mapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual(doc.category, [], 'remove newlines');
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(doc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('category_mapper: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
