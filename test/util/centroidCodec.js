
var path = require('path'),
    codec = require('../../util/centroidCodec');

var centroids = [
  { lat: 100.123456, lon: 95.223 },
  { lat: 1, lon: 1 },
  { lat: -100.5, lon: -100.767 }
];

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof codec.encode, 'function', 'encode is a function');
    t.equal(typeof codec.decode, 'function', 'decode is a function');
    t.end();
  });
};

module.exports.tests.encode = function(test, common) {
  test('encode()', function(t) {
    t.equal(codec.encode, codec.encodeSimple, 'using simple');
    t.end();
  });
};

module.exports.tests.decode = function(test, common) {
  test('decode()', function(t) {
    t.equal(codec.decode, codec.decodeSimple, 'using simple');
    t.end();
  });
};

module.exports.tests.encodeSimple = function(test, common) {
  test('encodeSimple()', function(t) {
    var centroid = { lat: 100.123456, lon: 95.223 };
    var encoded = codec.encodeSimple( centroid );
    t.equal(encoded, '100.123456:95.223', 'simple encoded');
    t.end();
  });
};

module.exports.tests.decodeSimple = function(test, common) {
  test('decodeSimple()', function(t) {
    var decoded = codec.decodeSimple( '100.123456:95.223' );
    t.deepEqual(decoded, { lat: 100.123456, lon: 95.223 }, 'simple decoded');
    t.end();
  });
};

module.exports.tests.simple = function(test, common) {
  test('simple functional', function(t) {
    centroids.forEach( function( centroid ){
      var encoded = codec.encodeSimple( centroid );
      var decoded = codec.decodeSimple( encoded );
      t.deepEqual(centroid, decoded, 'lossless');
    });
    t.end();
  });
};

module.exports.tests.encodeBase64 = function(test, common) {
  test('encodeBase64()', function(t) {
    var centroid = { lat: 100.123456, lon: 95.223 };
    var encoded = codec.encodeBase64( centroid );
    t.equal(encoded, 'MTAwLjEyMzQ1Njo5NS4yMjM=', 'base64 encoded');
    t.end();
  });
};

module.exports.tests.decodeBase64 = function(test, common) {
  test('decodeBase64()', function(t) {
    var decoded = codec.decodeBase64( 'MTAwLjEyMzQ1Njo5NS4yMjM=' );
    t.deepEqual(decoded, { lat: 100.123456, lon: 95.223 }, 'base64 decoded');
    t.end();
  });
};

module.exports.tests.base64 = function(test, common) {
  test('base64 functional', function(t) {
    centroids.forEach( function( centroid ){
      var encoded = codec.encodeBase64( centroid );
      var decoded = codec.decodeBase64( encoded );
      t.deepEqual(centroid, decoded, 'lossless');
    });
    t.end();
  });
};

/* should actually save disk space */
module.exports.tests.disk_space = function(test, common) {
  test('save disk space', function(t) {

    centroids.forEach( function( centroid ){
 
      var encoded = codec.encode( centroid );

      var json = JSON.stringify( centroid, null, 0 );
      t.ok(encoded.length <= json.length, 'equal/smaller than json');

      var concat = ( centroid.lat + ':' + centroid.lon );
      t.ok(encoded.length <= concat.length, 'equal/smaller than concat');

      var base64 = codec.encodeBase64( centroid );
      t.ok(encoded.length <= base64.length, 'equal/smaller than base64');
      
    });

    t.end();
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