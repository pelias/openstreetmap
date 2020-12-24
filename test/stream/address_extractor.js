
var extractor = require('../../stream/address_extractor');
var fixtures = require('../fixtures/docs');
var Document = require('pelias-model').Document;
var through = require('through2');
const stream_mock = require('stream-mock');

function test_stream(input, testedStream, callback) {
  const reader = new stream_mock.ObjectReadableMock(input);
  const writer = new stream_mock.ObjectWritableMock();
  writer.on('error', (e) => callback(e));
  writer.on('finish', () => callback(null, writer.data));
  reader.pipe(testedStream).pipe(writer);
}

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof extractor, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var stream = extractor();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    t.end();
  });
  test('interface: hasValidAddress', function(t) {
    t.equal(typeof extractor.hasValidAddress, 'function', 'function exposed for testing');
    t.end();
  });
};

// test the logic which decides if the document contains valid
// address data or not.
module.exports.tests.hasValidAddress = function(test, common) {
  test('hasValidAddress: invalid item', function(t) {
    t.false(extractor.hasValidAddress(null));
    t.end();
  });
  test('hasValidAddress: invalid address object', function(t) {
    t.false(extractor.hasValidAddress({}));
    t.end();
  });
  test('hasValidAddress: invalid address number', function(t) {
    t.false(extractor.hasValidAddress({address_parts:{street:'sesame st'}}));
    t.end();
  });
  test('hasValidAddress: invalid address number length', function(t) {
    t.false(extractor.hasValidAddress({address_parts:{number:'',street:'sesame st'}}));
    t.end();
  });
  test('hasValidAddress: invalid address street', function(t) {
    t.false(extractor.hasValidAddress({address_parts:{number:'10'}}));
    t.end();
  });
  test('hasValidAddress: invalid address street length', function(t) {
    t.false(extractor.hasValidAddress({address_parts:{number:'10',street:''}}));
    t.end();
  });
  test('hasValidAddress: valid address', function(t) {
    t.true(extractor.hasValidAddress({address_parts:{number:'10',street:'sesame st'}}));
    t.end();
  });
};

// a named document with invalid address data should pass
// through the stream without being modified.
module.exports.tests.passthrough = function(test, common) {
  test('passthrough: regular POI', function(t) {
    var stream = extractor();

    test_stream([fixtures.named], stream, function (err, actual) {
      t.equal(actual[0].getLayer(), 'venue', 'layer not changed');
      t.end();
    });
  });
};

// a document missing a name property & missing a valid address
// should be filtered and removed from the pipeline completely.
module.exports.tests.filter = function(test, common) {
  test('filter: invalid POI', function(t) {
    test_stream([fixtures.unnamed], extractor(), function (err, actual) {
      t.equal(actual.length, 0, 'invalid doc should get filtered out');
      t.end();
    });
  });
};

// test to ensure that when a document contains no valid name but
// does contains valid address data, we create a new record for the
// address and discard the original as it has no valid name.
module.exports.tests.createFromNameless = function(test, common) {
  test('create: from nameless record', function(t) {
    test_stream([fixtures.unnamedWithAddress], extractor(), function( err, actual ) {
      t.equal(actual.length, 1, 'correct number of results');
      t.equal(actual[0].getId(), 'item:3', 'address only id schema');
      t.deepEqual(Object.keys(actual[0].name), ['default'], 'only default name set');
      t.equal(actual[0].getName('default'), '10 Mapzen pl', 'correct name');
      t.equal(actual[0].getLayer(), 'address', 'layer changed');
      t.end();
    });
  });
};

// test to ensure that when a document contains a valid name &
// ALSO contains valid address data, we create a new record for the
// address and forward the original down the pipeline unaltered.
// The address record MUST be pushed down the pipeline before
// the POI record or errors can occur. see comment in test below.
module.exports.tests.duplicateFromPOIAddress = function(test, common) {
  test('create: from named record', function(t) {
    test_stream( [fixtures.namedWithAddress], extractor(), function( err, actual ) {
      t.equal(actual.length, 2, 'correct number of results');

      t.equal(actual[0].getId(), 'item:4', 'poi address id schema');
      t.equal(actual[0].getName('default'), '11 Sesame st', 'correct name');
      t.equal(actual[0].getLayer(), 'address', 'layer changed');

      t.equal(actual[1].getId(), 'item:4', 'id unchanged');
      t.equal(actual[1].getName('default'), 'poi4', 'correct name');
      t.equal(actual[1].getLayer(), 'address', 'layer unchanged');

      t.end(); // test should fail if not called, or called more than once.
    });
  });
};

// When duplicating the origin record to create an address record
// we must ensure that no properties are unintentionally missed.
// Also we need to ensure that the original document is not mutated.
module.exports.tests.duplicateAllFields = function(test, common) {
  test('create: duplicate records correctly', function(t) {
    test_stream([fixtures.completeDoc], extractor(), function( err, actual ) {
      // the first item pushed downstream should be the extracted address
      var docAddress = actual[0];
      t.equal(docAddress.getId(), 'item:6', 'changed');
      t.equal(docAddress.getLayer(), 'address', 'changed');
      t.deepEqual(Object.keys(docAddress.name).length, 1, 'changed');
      t.equal(docAddress.getName('default'), '13 Goldsmiths row', 'changed');
      t.false(docAddress.getName('alt'), 'unset');
      t.deepEqual(docAddress.getCentroid(), {lat: 6, lon: 6}, 'not changed');
      t.deepEqual(docAddress.getMeta('foo'), 'bar', 'not changed');
      t.deepEqual(docAddress.getMeta('bing'), 'bang', 'not changed');

      // second doc
      var docVenue = actual[1];
      t.equal(docVenue.getId(), 'item:6', 'not changed');
      t.equal(docVenue.getLayer(), 'venue', 'not changed');
      t.deepEqual(Object.keys(docVenue.name).length, 2, 'not changed');
      t.equal(docVenue.getName('default'), 'item6', 'not changed');
      t.equal(docVenue.getName('alt'), 'item six', 'not changed');
      t.deepEqual(docVenue.getCentroid(), {lat: 6, lon: 6}, 'not changed');
      t.deepEqual(docVenue.getMeta('foo'), 'bar', 'not changed');
      t.deepEqual(docVenue.getMeta('bing'), 'bang', 'not changed');

      t.end(); // test should fail if not called, or called more than twice.
    });
  });
};

// ========= semi-colon delimeted street numbers =========
// ref: https://github.com/pelias/openstreetmap/issues/21
module.exports.tests.semi_colon_street_numbers = function(test, common) {
  test('create: one record per street number', function(t) {
    test_stream([fixtures.semicolonStreetNumbers], extractor(), function( err, actual ) {
      t.equal(actual.length, 4, 'correct number of results');

      t.equal(actual[0].getId(), 'item:10', 'changed');
      t.equal(actual[0].getLayer(), 'address', 'changed');
      t.equal(actual[0].getName('default'), '1 Pennine Road', 'changed');
      t.equal(actual[0].getAddress('number'), '1', 'single number');

      t.equal(actual[1].getId(), 'item:10/1', 'changed');
      t.equal(actual[1].getLayer(), 'address', 'changed');
      t.equal(actual[1].getName('default'), '2 Pennine Road', 'changed');
      t.equal(actual[1].getAddress('number'), '2', 'single number');

      t.equal(actual[2].getId(), 'item:10/2', 'changed');
      t.equal(actual[2].getLayer(), 'address', 'changed');
      t.equal(actual[2].getName('default'), '3 Pennine Road', 'changed');
      t.equal(actual[2].getAddress('number'), '3', 'single number');

      t.equal(actual[3].getId(), 'item:10', 'not changed');
      t.equal(actual[3].getLayer(), 'venue', 'not changed');
      t.equal(actual[3].getName('default'), 'poi10', 'not changed');
      t.equal(actual[3].getAddress('number'), '1', 'first number');

      t.end(); // test should fail if not called, or called more than twice.
    });
  });
};

// ======================= errors ========================

// catch general errors in the stream, emit logs
// discard the address doc but passthrough the named poi
module.exports.tests.catch_thrown_errors = function(test, common) {
  test('errors - catch thrown errors', function(t) {
    var doc = new Document('a','b', 1);

    // this method will throw a generic Error for testing
    doc.getLayer = function(){ throw new Error('test'); };

    test_stream([doc], extractor(), function( err, actual ) {
      t.equal(actual.length, 0, 'no results');
      t.end();
    });
  });

  test('errors - passthrough named poi records', function(t) {
    var doc = new Document('a', 'b', 1);
    doc.setName('default','test');

    // this method will throw a generic Error for testing
    doc.getLayer = function(){ throw new Error('test'); };

    test_stream([doc], extractor(), function( err, actual ) {
      t.equal(actual[0].getName('default'), 'test', 'changed');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('address_extractor: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
