var sink = require('through2-sink');
var deduper = require('../../stream/deduper');

module.exports.tests = {};

module.exports.tests.enabled = function(test, common) {

  var config = {
    imports: {
      openstreetmap: {
        deduplicate: true
      }
    }
  };

  var deduperStream = { some: 'stream' };
  var deduperStreamFactory = function () {
    return deduperStream;
  };

  test('enabled: return deduper stream', function (t) {
    var stream = deduper(config, deduperStreamFactory);
    t.equal(stream, deduperStream, 'stream created');
    t.end();
  });

};

module.exports.tests.disabled = function (test, common) {
  var config = {
    imports: {
      openstreetmap: {
        deduplicate: false
      }
    }
  };

  test('disabled: return passthrough stream', function(t) {
    t.plan(2); // expect 2 assertions

    var dataItem = { some: 'data' };

    var stream = deduper(config, {});

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
    return tape('deduper: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};