
var stream = require('../../stream/osm_types'),
    through = require('through2');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof stream, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var streams = {
      node: through.obj(),
      way: through.obj(),
      relation: through.obj()
    };
    var s = stream( streams );
    t.equal(typeof s, 'object', 'valid stream');
    t.equal(typeof s._read, 'function', 'valid readable');
    t.equal(typeof s._write, 'function', 'valid writeable');
    t.end();
  });
};

module.exports.tests.splits_single_records = function(test, common) {
  test('splits: single records', function(t) {
    t.plan(3);

    var n = { type: 'node', data: 'n' };
    var nodes = through.obj(function(c,e,next){
      t.deepEqual(c,n);
      next();
    });

    var w = { type: 'way', data: 'w' };
    var ways = through.obj(function(c,e,next){
      t.deepEqual(c,w);
      next();
    });

    var r = { type: 'relation', data: 'r' };
    var relations = through.obj(function(c,e,next){
      t.deepEqual(c,r);
      next();
    });

    var s = stream({ node: nodes, way: ways, relation: relations });
    s.write( n );
    s.write( w );
    s.write( r );
  });
};

module.exports.tests.splits_arrays_of_records = function(test, common) {
  test('splits: arrays of records', function(t) {
    t.plan(3);

    var n = { type: 'node', data: 'n' };
    var nodes = through.obj(function(c,e,next){
      t.deepEqual(c,n);
      next();
    });

    var w = { type: 'way', data: 'w' };
    var ways = through.obj(function(c,e,next){
      t.deepEqual(c,w);
      next();
    });

    var r = { type: 'relation', data: 'r' };
    var relations = through.obj(function(c,e,next){
      t.deepEqual(c,r);
      next();
    });

    var s = stream({ node: nodes, way: ways, relation: relations });
    s.write( [ n, w, r ] );
  });
};

module.exports.tests.constructor = function(test, common) {
  test('constructor: invalid streams container', function(t) {
    try { var s = stream(); }
    catch( e ){
      t.equal( e.message, 'invalid types stream constructor' );
      t.end();
    }
  });
  test('constructor: invalid node stream', function(t) {
    var streams = {
      node: null,
      way: through.obj(),
      relation: through.obj()
    };
    try { var s = stream( streams ); }
    catch( e ){
      t.equal( e.message, 'invalid types stream constructor' );
      t.end();
    }
  });
  test('constructor: invalid way stream', function(t) {
    var streams = {
      node: through.obj(),
      way: null,
      relation: through.obj()
    };
    try { var s = stream( streams ); }
    catch( e ){
      t.equal( e.message, 'invalid types stream constructor' );
      t.end();
    }
  });
  test('constructor: invalid relation stream', function(t) {
    var streams = {
      node: through.obj(),
      way: through.obj(),
      relation: null
    };
    try { var s = stream( streams ); }
    catch( e ){
      t.equal( e.message, 'invalid types stream constructor' );
      t.end();
    }
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('osm_types: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};