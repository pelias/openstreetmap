
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
      t.equal( doc.getId(), '1', 'correct id' );
      t.equal( doc.getType(), 'osmX', 'correct type' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X' });
  });
  test('instantiate: invalid id', function(t) {
    var stream = constructor();
    t.throws(function(){
      stream.write({ type: 'X' });
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
};

module.exports.tests.noderefs = function(test, common) {
  var nodeData = [ 'X', 'Y' ];
  test('noderefs: valid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc.getMeta('nodes'), nodeData, 'noderefs set' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', nodes: nodeData });
  });
  test('noderefs: invalid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.false( doc.getMeta('nodes'), 'no noderefs' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X' });
  });
};

module.exports.tests.tags = function(test, common) {
  var tagData = [ 'X', 'Y' ];
  test('noderefs: valid', function(t) {
    var stream = constructor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc.getMeta('tags'), tagData, 'tags set' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write({ id: 1, type: 'X', tags: tagData });
  });
  test('noderefs: invalid', function(t) {
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