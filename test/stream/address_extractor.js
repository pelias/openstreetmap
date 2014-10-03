
var stream = require('../../stream/address_extractor'),
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
  test('interface: hasValidAddress', function(t) {
    var s = stream();
    t.equal(typeof s.hasValidAddress, 'function', 'function exposed for testing');
    t.end();
  });
};

module.exports.tests.hasValidAddress = function(test, common) {
  var s = stream();
  test('hasValidAddress: invalid item', function(t) {
    t.false(s.hasValidAddress(null));
    t.end();
  });
  test('hasValidAddress: invalid address object', function(t) {
    t.false(s.hasValidAddress({}));
    t.end();
  });
  test('hasValidAddress: invalid address number', function(t) {
    t.false(s.hasValidAddress({address:{street:'sesame st'}}));
    t.end();
  });
  test('hasValidAddress: invalid address number length', function(t) {
    t.false(s.hasValidAddress({address:{number:'',street:'sesame st'}}));
    t.end();
  });
  test('hasValidAddress: invalid address street', function(t) {
    t.false(s.hasValidAddress({address:{number:'10'}}));
    t.end();
  });
  test('hasValidAddress: invalid address street length', function(t) {
    t.false(s.hasValidAddress({address:{number:'10',street:''}}));
    t.end();
  });
  test('hasValidAddress: valid address', function(t) {
    t.true(s.hasValidAddress({address:{number:'10',street:'sesame st'}}));
    t.end();
  });
};

module.exports.tests.passthrough = function(test, common) {
  test('passthrough: regular POI', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.equal( chunk.type, 'item', 'item not changed' );
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({ id: 1, type: 'item', name: {
      default: 'poi1'
    }});
  });
  test('filter: invalid POI', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.end(); // test should fail if called.
      next();
    }));
    s.write( { id: 1, type: 'item' } ); // invalid name
    t.end();
  });
};

module.exports.tests.createAddress = function(test, common) {
  test('create: from nameless record', function(t) {
    var s = stream();
    s.pipe( through.obj( function( chunk, enc, next ){
      t.equal( chunk.id, 'address-item-1', 'new id' );
      t.deepEqual( Object.keys(chunk.name), ['default'], 'only default name set' );
      t.equal( chunk.name.default, '10 Sesame st', 'correct name' );
      t.equal( chunk.type, 'item', 'type unchanged' );
      t.deepEqual( chunk.center_point, { lat: 1, lon: 1 }, 'centroid unchanged' );
      t.deepEqual( chunk.alpha3, 'SES', 'alpha3 unchanged' );
      t.deepEqual( chunk.admin0, 'great sesame', 'admin0 unchanged' );
      t.deepEqual( chunk.admin1, 'new sesame city', 'admin1 unchanged' );
      t.deepEqual( chunk.admin1_abbr, 'SC', 'admin1_abbr unchanged' );
      t.deepEqual( chunk.admin2, 'sesameville', 'admin2 unchanged' );
      t.deepEqual( chunk.local_admin, 'sesamilia', 'local_admin unchanged' );
      t.deepEqual( chunk.locality, 'sesporado', 'locality unchanged' );
      t.deepEqual( chunk.neighborhood, 'sesame', 'neighborhood unchanged' );
      t.end(); // test should fail if not called.
      next();
    }));
    s.write({
      id: 1, type: 'item', _meta: { test: '123' },
      address:{
        number: '10', street: 'Sesame st'
      },
      center_point: { lat: 1, lon: 1 },
      alpha3: 'SES',
      admin0: 'great sesame',
      admin1: 'new sesame city',
      admin1_abbr: 'SC',
      admin2: 'sesameville',
      local_admin: 'sesamilia',
      locality: 'sesporado',
      neighborhood: 'sesame'
    });
  });
  test('create: from named record', function(t) {

    var item = {
      id: 1, type: 'item', _meta: { test: '123' },
      name: {
        default: 'elmo\'s house'
      },
      address:{
        number: '10', street: 'Sesame st'
      },
      center_point: { lat: 1, lon: 1 },
      admin0: 'great sesame',
      admin1: 'new sesame city',
      admin2: 'sesameville'
    };

    var s = stream();
    var i = 0;
    s.pipe( through.obj( function( chunk, enc, next ){
      if( i++ === 0 ){
        t.equal( chunk.id, 'poi-address-item-1', 'new id' );
        t.deepEqual( Object.keys(chunk.name), ['default'], 'only default name set' );
        t.equal( chunk.name.default, '10 Sesame st', 'correct name' );
        t.equal( chunk.type, item.type, 'type unchanged' );
        t.deepEqual( chunk.center_point, item.center_point, 'centroid unchanged' );
        t.deepEqual( chunk.alpha3, item.alpha3, 'alpha3 unchanged' );
        t.deepEqual( chunk.admin0, item.admin0, 'admin0 unchanged' );
        t.deepEqual( chunk.admin1, item.admin1, 'admin1 unchanged' );
        t.deepEqual( chunk.admin1_abbr, item.admin1_abbr, 'admin1_abbr unchanged' );
        t.deepEqual( chunk.admin2, item.admin2, 'admin2 unchanged' );
        t.deepEqual( chunk.local_admin, item.local_admin, 'local_admin unchanged' );
        t.deepEqual( chunk.locality, item.locality, 'locality unchanged' );
        t.deepEqual( chunk.neighborhood, item.neighborhood, 'neighborhood unchanged' );
        t.deepEqual( chunk._meta, item._meta, '_meta unchanged' );
        next();
      } else {
        t.equal( chunk.id, item.id, 'id unchanged' );
        t.deepEqual( Object.keys(chunk.name), ['default'], 'only default name set' );
        t.equal( chunk.name.default, item.name.default, 'correct name' );
        t.equal( chunk.type, item.type, 'type unchanged' );
        t.deepEqual( chunk.center_point, item.center_point, 'centroid unchanged' );
        t.deepEqual( chunk.alpha3, item.alpha3, 'alpha3 unchanged' );
        t.deepEqual( chunk.admin0, item.admin0, 'admin0 unchanged' );
        t.deepEqual( chunk.admin1, item.admin1, 'admin1 unchanged' );
        t.deepEqual( chunk.admin1_abbr, item.admin1_abbr, 'admin1_abbr unchanged' );
        t.deepEqual( chunk.admin2, item.admin2, 'admin2 unchanged' );
        t.deepEqual( chunk.local_admin, item.local_admin, 'local_admin unchanged' );
        t.deepEqual( chunk.locality, item.locality, 'locality unchanged' );
        t.deepEqual( chunk.neighborhood, item.neighborhood, 'neighborhood unchanged' );
        t.deepEqual( chunk._meta, item._meta, '_meta unchanged' );
        t.end(); // test should fail if not called, or called more than once.
        next();
      }
    }));
    s.write( item );
  });

  // the address record MUST be pushed down the pipeline before
  // the POI record or bad things happen. see comment in test below.
  test('create: address created before poi record', function(t) {

    var item = {
      id: 1, type: 'item', _meta: { test: '123' },
      name: {
        default: 'elmo\'s house'
      },
      address:{
        number: '10', street: 'Sesame st'
      },
      center_point: { lat: 1, lon: 1 },
      admin0: 'great sesame',
      admin1: 'new sesame city',
      admin2: 'sesameville'
    };

    var s = stream();
    var i = 0;
    s.pipe( through.obj( function( chunk, enc, next ){
      if( i++ === 0 ){
        t.equal( chunk.id, 'poi-address-item-1', 'new id' );
        next();
      } else {
        t.equal( chunk.id, item.id, 'id unchanged' );
        t.end(); // test should fail if not called, or called more than once.
        next();
      }
    }));
    s.write( item );
  });

  // if something bad happends and the primary record id is unset before
  // the address record is generated; we generate a unique ordinal id.
  // This was the case when the esclient deletes id before storing the record
  // In an ideal world this would not need to exist, it remains to avoid errors
  test('create: from nameless record - generates unique ids', function(t) {
    t.plan(2); // should run 2 tests
    var s = stream();
    var ordinal = 0;
    s.pipe( through.obj( function( chunk, enc, next ){
      if( ++ordinal === 1 ){
        t.equal( chunk.id, 'address-item-1', 'unique id' );
      } else {
        t.equal( chunk.id, 'address-item-2', 'unique id' );
      }
      next();
    }));
    s.write({
      type: 'item', _meta: { test: '123' },
      address:{
        number: '10', street: 'Sesame st'
      },
      center_point: { lat: 1, lon: 1 },
      admin0: 'great sesame',
      admin1: 'new sesame city',
      admin2: 'sesameville'
    });
    s.write({
      type: 'item', _meta: { test: '123' },
      address:{
        number: '10', street: 'Sesame st'
      },
      center_point: { lat: 1, lon: 1 },
      admin0: 'great sesame',
      admin1: 'new sesame city',
      admin2: 'sesameville'
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