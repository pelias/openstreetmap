
var through = require('through2'),
    constructor = require('../../stream/document_constructor'),
    Document = require('pelias-model').Document;

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof constructor, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var stream = constructor();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    t.end();
  });
};

module.exports.tests.instantiate = function(test, common) {
  test('instantiate: valid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( Object.getPrototypeOf(doc), Document.prototype, 'correct proto' );
      t.equal( doc.getId(), 'X/1', 'correct id' );
      t.equal( doc.getType(), 'venue', 'defaults to venue' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X' });
  });
};

// catch pelias/model errors and continue, erroneous docs
// should not be piped downstream
module.exports.tests.model_errors = function(test, common) {
  test('model errors: avoid fatal errors', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.end(); // test will fail if document is piped downstream
      next();
    }));
    t.doesNotThrow( function emptyDocument(){
      stream.write({});
    });
    t.end();
  });
};

module.exports.tests.centroid = function(test, common) {
  test('centroid: valid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), { lat: 1, lon: 1 }, 'correct centroid' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', lat: 1, lon: 1 });
  });
  test('centroid: invalid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), {}, 'no centroid' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X' });
  });
  test('centroid: contains zero value', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), { lat: 0, lon: 0 }, 'accepts zero values' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', lat: 0, lon: 0 });
  });
  test('centroid: from preprocessed centroid property', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), { lat: 1, lon: 2 }, 'accepts centroid property' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', centroid: { lat: 1, lon: 2 } } );
  });
  test('centroid: prefers lat/lon to centroid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), { lat: 1, lon: 1 }, 'prefers lat/lon' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', lat: 1, lon: 1, centroid: { lat: 2, lon: 2 } } );
  });
};

module.exports.tests.bounds = function(test, common) {
  test('bounds: no bbox provided', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getBoundingBox(), undefined, 'undefined bounds' );
      t.end();
      next();
    }));
    stream.write({ id: 1, type: 'X', lat: 1, lon: 1 });
  });
  test('bounds: bbox not object', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getBoundingBox(), undefined, 'undefined bounds' );
      t.end();
      next();
    }));
    stream.write({ id: 1, type: 'X', lat: 1, lon: 1, bounds: [] });
  });
  test('bounds: valid bbox provided', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getBoundingBox(), '{"min_lat":-1.1,"max_lat":1.1,"min_lon":-2.2,"max_lon":2.2}', 'valid bounds' );
      t.end();
      next();
    }));
    stream.write({ id: 1, type: 'X', lat: 1, lon: 1, bounds: {
      n: +1.1, s: -1.1, w: -2.2, e: +2.2
    }});
  });
  test('bounds: partial bbox provided - skip record', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.end(); // test will fail if document is piped downstream
      next();
    }));
    t.doesNotThrow( function emptyDocument(){
      stream.write({ id: 1, type: 'X', lat: 1, lon: 1, bounds: {
        n: +1.1, s: -1.1
      }});
    });
    t.end();
  });
};

module.exports.tests.tags = function(test, common) {
  var tagData = [ 'X', 'Y' ];
  test('tags: valid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc.getMeta('tags'), tagData, 'tags set' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', tags: tagData });
  });
  test('tags: invalid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getMeta('tags'), {}, 'no tags' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X' });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('document_constructor: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
