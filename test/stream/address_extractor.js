
var extractor = require('../../stream/address_extractor'),
    fixtures = require('../fixtures/docs'),
    Document = require('pelias-model').Document,
    through = require('through2');

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
    t.false(extractor.hasValidAddress({address:{street:'sesame st'}}));
    t.end();
  });
  test('hasValidAddress: invalid address number length', function(t) {
    t.false(extractor.hasValidAddress({address:{number:'',street:'sesame st'}}));
    t.end();
  });
  test('hasValidAddress: invalid address street', function(t) {
    t.false(extractor.hasValidAddress({address:{number:'10'}}));
    t.end();
  });
  test('hasValidAddress: invalid address street length', function(t) {
    t.false(extractor.hasValidAddress({address:{number:'10',street:''}}));
    t.end();
  });
  test('hasValidAddress: valid address', function(t) {
    t.true(extractor.hasValidAddress({address:{number:'10',street:'sesame st'}}));
    t.end();
  });
};

// a named document with invalid address data should pass
// through the stream without being modified.
module.exports.tests.passthrough = function(test, common) {
  test('passthrough: regular POI', function(t) {
    var stream = extractor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc.getType(), 'item1', 'type not changed' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.named);
  });
};

// a document missing a name property & missing a valid address
// should be filtered and removed from the pipeline completely.
module.exports.tests.filter = function(test, common) {
  test('filter: invalid POI', function(t) {
    var stream = extractor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.end(); // test will fail if doc is not filtered.
      next();
    }));
    stream.write(fixtures.unnamed);
    t.end();
  });
};

// test to ensure that when a document contains no valid name but
// does contains valid address data, we create a new record for the
// address and discard the original as it has no valid name.
module.exports.tests.createFromNameless = function(test, common) {
  test('create: from nameless record', function(t) {
    var stream = extractor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc.getId(), 'osm-item3-address-3', 'address only id schema' );
      t.deepEqual( Object.keys(doc.name), ['default'], 'only default name set' );
      t.equal( doc.getName('default'), '10 Mapzen pl', 'correct name' );
      t.equal( doc.getType(), 'address', 'type changed' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.unnamedWithAddress);
  });
};

// test to ensure that when a document contains a valid name &
// ALSO contains valid address data, we create a new record for the
// address and forward the original down the pipeline unaltered.
// The address record MUST be pushed down the pipeline before
// the POI record or errors can occur. see comment in test below.
module.exports.tests.duplicateFromPOIAddress = function(test, common) {
  test('create: from named record', function(t) {
    t.plan(6);
    var stream = extractor();
    var i = 0; // count total records coming out of the stream
    stream.pipe( through.obj( function( doc, enc, next ){
      // first doc
      if( i++ === 0 ){
        t.equal( doc.getId(), 'osm-item4-poi-address-4', 'poi address id schema' );
        t.equal( doc.getName('default'), '11 Sesame st', 'correct name' );
        t.equal( doc.getType(), 'address', 'type changed' );
        next();
      // second doc
      } else {
        t.equal( doc.getId(), '4', 'id unchanged' );
        t.equal( doc.getName('default'), 'poi4', 'correct name' );
        t.equal( doc.getType(), 'item4', 'type unchanged' );
        t.end(); // test should fail if not called, or called more than once.
        next();
      }
    }));
    stream.write(fixtures.namedWithAddress);
  });
};

// When duplicating the origin record to create an address record
// we must ensure that no properties are unintentially missed.
// Also we need to ensure that the original document is not mutated.
module.exports.tests.duplicateAllFields = function(test, common) {
  test('create: duplicate records correctly', function(t) {
    t.plan(32);
    var stream = extractor();
    var i = 0;
    stream.pipe( through.obj( function( doc, enc, next ){
      // first doc
      if( i++ === 0 ){
        t.equal( doc.getId(), 'osm-item6-poi-address-6', 'changed' );
        t.equal( doc.getType(), 'address', 'changed' );
        t.deepEqual( Object.keys(doc.name).length, 1, 'changed' );
        t.equal( doc.getName('default'), '13 Goldsmiths row', 'changed' );
        t.false( doc.getName('alt'), 'unset' );
        t.deepEqual( doc.getCentroid(), { lat: 6, lon: 6 }, 'not changed' );
        t.deepEqual( doc.getAlpha3(), 'FOO', 'not changed' );
        t.deepEqual( doc.getAdmin('admin0'), 'country', 'not changed' );
        t.deepEqual( doc.getAdmin('admin1'), 'state', 'not changed' );
        t.deepEqual( doc.getAdmin('admin1_abbr'), 'STA', 'not changed' );
        t.deepEqual( doc.getAdmin('admin2'), 'city', 'not changed' );
        t.deepEqual( doc.getAdmin('local_admin'), 'borough', 'not changed' );
        t.deepEqual( doc.getAdmin('locality'), 'town', 'not changed' );
        t.deepEqual( doc.getAdmin('neighborhood'), 'hood', 'not changed' );
        t.deepEqual( doc.getMeta('foo'), 'bar', 'not changed' );
        t.deepEqual( doc.getMeta('bing'), 'bang', 'not changed' );
      // second doc
      } else {
        t.equal( doc.getId(), '6', 'not changed' );
        t.equal( doc.getType(), 'item6', 'not changed' );
        t.deepEqual( Object.keys(doc.name).length, 2, 'not changed' );
        t.equal( doc.getName('default'), 'item6', 'not changed' );
        t.equal( doc.getName('alt'), 'item six', 'not changed' );
        t.deepEqual( doc.getCentroid(), { lat: 6, lon: 6 }, 'not changed' );
        t.deepEqual( doc.getAlpha3(), 'FOO', 'not changed' );
        t.deepEqual( doc.getAdmin('admin0'), 'country', 'not changed' );
        t.deepEqual( doc.getAdmin('admin1'), 'state', 'not changed' );
        t.deepEqual( doc.getAdmin('admin1_abbr'), 'STA', 'not changed' );
        t.deepEqual( doc.getAdmin('admin2'), 'city', 'not changed' );
        t.deepEqual( doc.getAdmin('local_admin'), 'borough', 'not changed' );
        t.deepEqual( doc.getAdmin('locality'), 'town', 'not changed' );
        t.deepEqual( doc.getAdmin('neighborhood'), 'hood', 'not changed' );
        t.deepEqual( doc.getMeta('foo'), 'bar', 'not changed' );
        t.deepEqual( doc.getMeta('bing'), 'bang', 'not changed' );
        t.end(); // test should fail if not called, or called more than twice.
      }
      next();
    }));
    stream.write(fixtures.completeDoc);
  });
};

// ========= semi-colon delimeted street numbers =========
// ref: https://github.com/pelias/openstreetmap/issues/21
module.exports.tests.semi_colon_street_numbers = function(test, common) {
  test('create: one record per street number', function(t) {
    t.plan(12);
    var stream = extractor();
    var i = 0;
    stream.pipe( through.obj( function( doc, enc, next ){
      // first doc
      if( i === 0 ){
        t.equal( doc.getId(), 'osm-item10-poi-address-10', 'changed' );
        t.equal( doc.getType(), 'address', 'changed' );
        t.equal( doc.getName('default'), '1 Pennine Road', 'changed' );
      // second doc
      } else if( i === 1 ){
        t.equal( doc.getId(), 'osm-item10-poi-address-10-2', 'changed' );
        t.equal( doc.getType(), 'address', 'changed' );
        t.equal( doc.getName('default'), '2 Pennine Road', 'changed' );
      // third doc
      } else if( i === 2 ){
        t.equal( doc.getId(), 'osm-item10-poi-address-10-3', 'changed' );
        t.equal( doc.getType(), 'address', 'changed' );
        t.equal( doc.getName('default'), '3 Pennine Road', 'changed' );
      // last doc
      } else {
        t.equal( doc.getId(), '10', 'not changed' );
        t.equal( doc.getType(), 'item10', 'not changed' );
        t.equal( doc.getName('default'), 'poi10', 'not changed' );
        t.end(); // test should fail if not called, or called more than twice.
      }

      i++;
      next();
    }));
    stream.write(fixtures.semicolonStreetNumbers);
  });
};

// ======================= errors ========================

// catch general errors in the stream, emit logs
// discard the address doc but passthrough the named poi
module.exports.tests.catch_thrown_errors = function(test, common) {
  test('errors - catch thrown errors', function(t) {
    var doc = new Document('a','b', 1);

    // this method will throw a generic Error for testing
    doc.getType = function(){ throw new Error('test'); };

    var stream = extractor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.end(); // test will fail if called (called twice).
      next();
    }));
    stream.write(doc);
    t.end();
  });
  test('errors - passthrough named poi records', function(t) {
    var doc = new Document('a', 'b', 1);
    doc.setName('default','test');

    // this method will throw a generic Error for testing
    doc.getType = function(){ throw new Error('test'); };

    var stream = extractor();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc.getName('default'), 'test', 'changed' );
      t.end(); // test should fail if not called, or called twice.
      next();
    }));
    stream.write(doc);
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