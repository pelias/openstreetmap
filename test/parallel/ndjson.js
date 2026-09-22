'use strict';

const ndjson = require('../../parallel/ndjson');

module.exports.tests = {};

function collect(chunks, cb) {
  const stream = ndjson.create();
  const docs = [];
  stream.on('data', (doc) => docs.push(doc));
  stream.on('error', (err) => cb(err, docs));
  stream.on('end', () => cb(null, docs));
  chunks.forEach((chunk) => stream.write(Buffer.from(chunk)));
  stream.end();
}

module.exports.tests.decoding = function(test, common) {
  test('decodes one object per line', function(t) {
    collect(['{"id":1}\n{"id":2}\n'], (err, docs) => {
      t.error(err);
      t.deepEqual(docs, [{ id: 1 }, { id: 2 }]);
      t.end();
    });
  });

  test('joins lines split across chunk boundaries', function(t) {
    collect(['{"id"', ':1}\n{"i', 'd":2}\n'], (err, docs) => {
      t.error(err);
      t.deepEqual(docs, [{ id: 1 }, { id: 2 }]);
      t.end();
    });
  });

  test('decodes a final line with no trailing newline', function(t) {
    collect(['{"id":1}\n{"id":2}'], (err, docs) => {
      t.error(err);
      t.deepEqual(docs, [{ id: 1 }, { id: 2 }]);
      t.end();
    });
  });

  test('skips empty lines', function(t) {
    collect(['{"id":1}\n\n\n{"id":2}\n'], (err, docs) => {
      t.error(err);
      t.deepEqual(docs, [{ id: 1 }, { id: 2 }]);
      t.end();
    });
  });

  test('malformed json is an error, not a silently dropped record', function(t) {
    collect(['{"id":1}\n{"id":\n'], (err, docs) => {
      t.ok(err, 'error emitted');
      t.ok(/failed to decode json/.test(err.message));
      t.deepEqual(docs, [{ id: 1 }], 'earlier records still emitted');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('ndjson: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
