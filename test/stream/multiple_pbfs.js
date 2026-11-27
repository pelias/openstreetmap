'use strict';

const stream = require('stream');
const proxyquire = require('proxyquire');

module.exports.tests = {};

function fakeConfig(filenames) {
  return {
    generate: () => ({
      imports: {
        openstreetmap: {
          datapath: '/data',
          leveldbpath: '/tmp',
          import: filenames.map((filename) => ({ filename: filename }))
        }
      }
    })
  };
}

function create(filenames, createRecordStream) {
  return proxyquire('../../stream/multiple_pbfs', {
    'pelias-config': fakeConfig(filenames),
    './source': { createRecordStream: createRecordStream }
  }).create();
}

function collect(readable, cb) {
  const records = [];
  readable.on('data', (record) => records.push(record));
  readable.on('end', () => cb(null, records));
  readable.on('error', (err) => cb(err, records));
}

module.exports.tests.sequential = function(test, common) {
  test('reads each file in order', function(t) {
    const opened = [];
    const readable = create(['a.pbf', 'b.pbf'], (conf) => {
      opened.push(conf.file);
      return stream.Readable.from([{ file: conf.file, id: 1 }, { file: conf.file, id: 2 }]);
    });

    collect(readable, (err, records) => {
      t.error(err, 'no error');
      t.deepEqual(opened, ['/data/a.pbf', '/data/b.pbf'], 'paths from config');
      t.deepEqual(records, [
        { file: '/data/a.pbf', id: 1 },
        { file: '/data/a.pbf', id: 2 },
        { file: '/data/b.pbf', id: 1 },
        { file: '/data/b.pbf', id: 2 }
      ], 'all records, in file order');
      t.end();
    });
  });

  test('opens the next file only once the previous has ended', function(t) {
    const first = new stream.PassThrough({ objectMode: true });
    const opened = [];
    const readable = create(['a.pbf', 'b.pbf'], (conf) => {
      opened.push(conf.file);
      return conf.file === '/data/a.pbf' ? first : stream.Readable.from([{ id: 2 }]);
    });

    collect(readable, (err, records) => {
      t.error(err, 'no error');
      t.deepEqual(records, [{ id: 1 }, { id: 2 }], 'all records');
      t.end();
    });

    first.write({ id: 1 });
    setImmediate(() => {
      t.deepEqual(opened, ['/data/a.pbf'], 'second file not yet opened');
      first.end();
    });
  });

  test('an error in any file errors the stream', function(t) {
    const readable = create(['a.pbf', 'b.pbf'], (conf) => {
      if (conf.file === '/data/a.pbf') { return stream.Readable.from([{ id: 1 }]); }
      const failing = new stream.Readable({ objectMode: true, read: () => {} });
      setImmediate(() => failing.destroy(new Error('pbf2json exited with code 1')));
      return failing;
    });

    collect(readable, (err, records) => {
      t.equal(err && err.message, 'pbf2json exited with code 1', 'error forwarded');
      t.deepEqual(records, [{ id: 1 }], 'records before the error');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('multiple_pbfs: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
