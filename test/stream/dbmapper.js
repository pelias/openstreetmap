
var dbmapper = require('../../stream/dbmapper'),
    fixtures = require('../fixtures/docs'),
    through = require('through2');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof dbmapper, 'function', 'stream factory');
    t.end();
  });
  test('interface: stream', function(t) {
    var stream = dbmapper();
    t.equal(typeof stream, 'object', 'valid stream');
    t.equal(typeof stream._read, 'function', 'valid readable');
    t.equal(typeof stream._write, 'function', 'valid writeable');
    t.end();
  });
};

// an evelope must be wrapped around the data so that the data
// being piped to dbclient is what it expects to receive.
module.exports.tests.envelope = function(test, common) {
  test('wrap doc in envelope', function(t) {
    var stream = dbmapper();
    stream.pipe( through.obj( function( doc, enc, next ){
      t.equal( doc._index, 'pelias', 'index name set' );
      t.equal( doc._id, fixtures.completeDoc.getId(), 'id set' );
      t.equal( doc._type, fixtures.completeDoc.getType(), 'type set' );
      t.equal( doc.data, fixtures.completeDoc, 'body set' );
      t.end(); // test will fail if not called (or called twice).
      next();
    }));
    stream.write(fixtures.completeDoc);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('dbmapper: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};