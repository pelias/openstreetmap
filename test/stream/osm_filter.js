
var stream = require('../../stream/osm_filter'),
    features = require('../../features').features,
    through = require('through2');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof stream, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var s = stream();
    t.equal(typeof s, 'object', 'valid stream');
    t.equal(typeof s._read, 'function', 'valid readable');
    t.equal(typeof s._write, 'function', 'valid writeable');
    t.end();
  });
};

module.exports.tests.filter = function(test, common) {
  test('filter: invalid objects', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write( null ); // invalid object
    t.end();
  });

  // nodes 
  test('filter: node: invalid id', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'node', lat: 1, lon: 1, tags: {
      name: 'poi1',
      building: 'building'
    }});
    t.end();
  });
  test('filter: node: invalid lat', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'node', id: 1, lon: 1, tags: {
      name: 'poi1',
      building: 'building'
    }});
    t.end();
  });
  test('filter: node: invalid lon', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'node', id: 1, lat: 1, tags: {
      name: 'poi1',
      building: 'building'
    }});
    t.end();
  });
  test('filter: node: no tags', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'node', id: 1, lat: 1, lon: 1 });
    t.end();
  });
  test('filter: node: no name tag', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'node', id: 1, lat: 1, lon: 1, tags: {
      building: 'building'
    }});
    t.end();
  });
  test('filter: node: not in feature list', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'node', id: 1, lat: 1, lon: 1, tags: {
      name: 'poi1',
      foo: 'bar'
    }});
    t.end();
  });


  // ways 
  test('filter: way: invalid id', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'way', refs: [1], tags: {
      name: 'poi1',
      building: 'building'
    }});
    t.end();
  });
  test('filter: way: no tags', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'way', id: 1, refs: [1] });
    t.end();
  });
  test('filter: way: no name tag', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'way', id: 1, refs: [1], tags: {
      building: 'building'
    }});
    t.end();
  });
  test('filter: way: not in feature list', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'way', id: 1, refs: [1], tags: {
      name: 'poi1',
      foo: 'bar'
    }});
    t.end();
  });
  test('filter: way: empty refs', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write({ type: 'way', id: 1, refs: [], tags: {
      name: 'poi1',
      foo: 'bar'
    }});
    t.end();
  });
};

module.exports.tests.passthrough = function(test, common) {

  // nodes
  test('pass: node: regular POI', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({ type: 'node', id: 1, lat: 1, lon: 1, tags: {
      name: 'poi1',
      building: 'building'
    }});
  });
  test('pass: node: regular address', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({ type: 'node', id: 1, lat: 1, lon: 1, tags: {
      'addr:housenumber': 130,
      'addr:street': 'Dean Street'
    }});
  });
  test('pass: node: zero id/lat/lon', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({ type: 'node', id: 0, lat: 0, lon: 0, tags: {
      name: 'poi1',
      building: 'building'
    }});
  });
  features.forEach( function( feature ){
    test('pass: node: valid feature ' + feature, function(t) {
      var s = stream();
      s.pipe( through.obj( function( chunk, enc, next ){
        t.end(); // test should fail if not called.
        next();
      }));
      var tags = { name: 'poi1' };
      tags[feature] = feature;
      s.write({ type: 'node', id: 1, lat: 1, lon: 1, tags: tags });
    });
  });

  // ways
  test('pass: way: regular POI', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({ type: 'way', id: 1, refs: [1], tags: {
      name: 'poi1',
      building: 'building'
    }});
  });
  test('pass: way: regular address', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({ type: 'way', id: 1, refs: [1], tags: {
      'addr:housenumber': 130,
      'addr:street': 'Dean Street'
    }});
  });
  features.forEach( function( feature ){
    test('pass: way: valid feature ' + feature, function(t) {
      var s = stream();
      s.pipe( through.obj( function( chunk, enc, next ){
        t.end(); // test should fail if not called.
        next();
      }));
      var tags = { name: 'poi1' };
      tags[feature] = feature;
      s.write({ type: 'way', id: 1, refs: [1], tags: tags });
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('osm_filter: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};