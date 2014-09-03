
var path = require('path'),
    buildHierachy = require('../../../../stream/osm/any/buildHierachy');

module.exports.tests = {};

function mockAdapter( t, point, name ){
  return function( centroid, opts, cb ){
    t.equal( centroid, point, 'centroid passed to adapter' );
    return cb( undefined, [{ 'name.default': name }] );
  };
}

function mockAdapterError( error ){
  return function( centroid, opts, cb ){
    return cb( error );
  };
}

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof buildHierachy, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.build = function(test, common) {
  test('build()', function(t) {
    var point = { lat: 100, lon: 50 };
    var backends = [
      { type: 'a', adapter: { findAdminHeirachy: mockAdapter( t, point, 'record1' ) } },
      { type: 'b', adapter: { findAdminHeirachy: mockAdapter( t, point, 'record2' ) } }
    ];
    buildHierachy( backends, point, function( err, resp ){
      t.equal( err, undefined, 'no error' );
      t.deepEqual( resp, { a: 'record1', b: 'record2' }, 'correctly reduced' );
      t.end();
    });
  });
  test('build error', function(t) {
    var point = { lat: 100, lon: 50 };
    var backends = [
      { type: 'a', adapter: { findAdminHeirachy: mockAdapterError( 'an error' ) } },
      { type: 'b', adapter: { findAdminHeirachy: mockAdapter( t, point, 'record2' ) } }
    ];
    buildHierachy( backends, point, function( err, resp ){
      t.equal( err, undefined, 'no error' );
      t.deepEqual( resp, { b: 'record2' }, 'correctly reduced despite error' );
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('codec: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};