
var denormalizer = require('../../stream/denormalizer'),
    fixtures = require('../fixtures/docs'),
    through = require('through2');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof denormalizer, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var stream = denormalizer();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    t.end();
  });
};

// perform a no-op for non-way docs such as nodes and relations
module.exports.tests.passthrough = function(test, common) {
  test('passthrough: nodes', function(t) {
    var stream = denormalizer();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc, fixtures.osmNode1, 'no-op for nodes' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.osmNode1);
  });
  test('passthrough: relations', function(t) {
    var stream = denormalizer();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc, fixtures.osmRelation1, 'no-op for relations' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.osmRelation1);
  });
};

// compute centroid for ways
module.exports.tests.computeWayCentroid = function(test, common) {
  test('compute centroid: ways', function(t) {
    var stream = denormalizer();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), { lat: 8.004813, lon: 8 }, 'centroid computed' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.osmWay1);
  });
};

// skip computing centroid where centroid info already available in src
module.exports.tests.skipComputeWayCentroid = function(test, common) {
  test('compute centroid: skip', function(t) {
    var stream = denormalizer();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getCentroid(), { lat: 11, lon: 11 }, 'centroid computed' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.osmWay2);
  });
};

// compute bbox for ways
module.exports.tests.computeWayBBox = function(test, common) {
  test('compute bbox: ways', function(t) {
    
    var expectedBBox = '{"min_lat":6,"max_lat":10,"min_lon":6,"max_lon":10}';

    var stream = denormalizer();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.deepEqual( doc.getBoundingBox(), expectedBBox, 'bbox computed' );
      t.end();
      next();
    }));
    stream.write(fixtures.osmWay1);
  });
};


module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('denormalizer: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};