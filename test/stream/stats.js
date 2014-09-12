
var stats = require('../../stream/stats'),
    through = require('through2');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof stats, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var s = stats( 'title' );
    t.equal(typeof s, 'object', 'valid stream');
    t.equal(typeof s._read, 'function', 'valid readable');
    t.equal(typeof s._write, 'function', 'valid writeable');
    t.end();
  });
};

module.exports.tests.pipe = function(test, common) {
  test('logging starts on pipe', function(t) {
    stats._reset();
    var s = stats( 'title' );
    var mock = through.obj( function(){} );
    s.log = function(){
      clearInterval( stats.interval );
      t.end();
    };
    mock.pipe(s);
  });
};

module.exports.tests.unpipe = function(test, common) {
  test('logging ends on unpipe', function(t) {
    stats._reset();
    var s = stats( 'title' );
    var mock = through.obj( function(){} );
    s.log = function(){};
    s.on( 'clear', function(){
      t.end();
    });
    mock.pipe(s);
    mock.unpipe();
  });
};

module.exports.tests.unpipe_emit = function(test, common) {
  test('emit one last log on unpipe', function(t) {
    stats._reset();
    var s = stats( 'title' );
    var mock = through.obj( function(){} );
    s.log = function(){
      t.end();
    };
    mock.pipe(s);
    mock.unpipe();
  });
};

module.exports.tests.enabled = function(test, common) {
  test('emit logs when enabled', function(t) {
    stats._reset();
    var s = stats( 'title' );
    var mock = through.obj( function( c, e, next ){
      this.push( c );
      next();
    });
    s.log = function( store ){
      t.deepEqual( store, { title: 1 }, 'loggin enabled' );
      clearInterval( stats.interval );
      t.end();
    };
    mock.pipe(s);
    mock.write( 'test' );
  });
};

module.exports.tests.disabled = function(test, common) {
  test('no logs when disabled', function(t) {
    stats._reset();
    stats.enabled = false; // disable stats;
    var s = stats( 'title' );
    var mock = through.obj( function( c, e, next ){
      this.push( c );
      next();
    });
    s.log = function( store ){
      t.end(); // test will fail if called
    };
    mock.pipe(s);
    mock.write( 'test' );
    mock.unpipe();
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('stats: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};