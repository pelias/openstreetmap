var sink = require('through2-sink');
var adminLookup = require('../../stream/adminLookup');

module.exports.tests = {};

module.exports.tests.enabled = function(test, common) {

  var config = {
    imports: {
      openstreetmap: {
        adminLookup: true
      },
      adminLookup: {
        url: 'foo.com'
      }
    }
  };

  var wofAdminLookup = {
    createLocalWofPipResolver: function () {
    },
    createLookupStream: function () {
    }
  };

  test('enabled: create pipResolver', function (t) {
    // assert that the PipResolver was instantiated with the correct URL
    wofAdminLookup.createLocalWofPipResolver = function () {
      t.pass('Resolver created');
      t.end();
    };

    adminLookup(config, wofAdminLookup);
  });

  test('enabled: pip resolver is passed into stream constructor', function (t) {
    t.plan(1); // expect 3 assertions

    var pipResolverMock = {foo: 'bar'};

    // mock the creation of pip resolver
    wofAdminLookup.createLocalWofPipResolver = function () {
      return pipResolverMock;
    };

    wofAdminLookup.createLookupStream = function (pipResolver) {
      t.equal(pipResolver, pipResolverMock);
      t.end();
    };

    adminLookup(config, wofAdminLookup);
  });

  test('enabled: return pip stream', function (t) {
    t.plan(1); // expect 2 assertions

    var streamMock = {madeBy: 'mock'};

    wofAdminLookup.createLocalWofPipResolver = function () {
    };
    wofAdminLookup.createLookupStream = function () {
      return streamMock;
    };

    var stream = adminLookup(config, wofAdminLookup);
    t.equal(stream, streamMock, 'stream created');
    t.end();
  });

};

module.exports.tests.disabled = function (test, common) {
  var config = {
    imports: {
      openstreetmap: {
        adminLookup: false
      }
    }
  };

  test('disabled: return passthrough stream', function(t) {
    t.plan(2); // expect 2 assertions

    var dataItem = { some: 'data' };

    var stream = adminLookup(config, {});

    t.equal(typeof stream, 'object', 'disabled stream is an object');

    stream.pipe(sink.obj( function (doc) {
      t.deepEqual(doc, dataItem);
      t.end();
    }));

    stream.write(dataItem);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('adminLookup: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};