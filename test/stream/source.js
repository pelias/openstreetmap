'use strict';

const fs = require('fs');
const stream = require('stream');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const proxyquire = require('proxyquire');

const source = require('../../stream/source');

module.exports.tests = {};

function tempFile(name, contents) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'osm-source-')), name);
  fs.writeFileSync(file, contents);
  return file;
}

const RECORDS = [
  { id: 1, type: 'node', lat: 1, lon: 2, tags: { name: 'one' } },
  { id: 2, type: 'way', centroid: { lat: 3, lon: 4 }, tags: { name: 'two' } }
];

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof source.isJsonSource, 'function', 'isJsonSource function');
    t.equal(typeof source.createRecordStream, 'function', 'createRecordStream function');
    t.equal(typeof source.createByteStream, 'function', 'createByteStream function');
    t.equal(typeof source.importConfigs, 'function', 'importConfigs function');
    t.equal(typeof source.createImportStream, 'function', 'createImportStream function');
    t.end();
  });
};

module.exports.tests.isJsonSource = function(test, common) {
  test('stored pbf2json output is recognised by extension', function(t) {
    t.true(source.isJsonSource('/data/planet.ndjson'));
    t.true(source.isJsonSource('/data/planet.ldjson'));
    t.true(source.isJsonSource('/data/planet.jsonl'));
    t.true(source.isJsonSource('/data/PLANET.NDJSON'), 'case insensitive');
    t.end();
  });

  test('compressed stored output is recognised too', function(t) {
    t.true(source.isJsonSource('/data/pbf2json.pelias.jsonl.gz'), 'as stored by the processing job');
    t.true(source.isJsonSource('/data/planet.ndjson.gz'));
    t.true(source.isCompressed('/data/planet.ndjson.gz'));
    t.false(source.isCompressed('/data/planet.ndjson'));
    t.end();
  });

  test('anything else is treated as a pbf', function(t) {
    t.false(source.isJsonSource('/data/planet-latest.osm.pbf'));
    t.false(source.isJsonSource('/data/planet.json'), 'plain json is not line delimited');
    t.false(source.isJsonSource('/data/planet.osm.pbf.gz'), 'a compressed pbf is not stored output');
    t.false(source.isJsonSource(''));
    t.false(source.isJsonSource(undefined));
    t.end();
  });
};

module.exports.tests.recordStream = function(test, common) {
  test('a stored file is read as records, without pbf2json', function(t) {
    const file = tempFile('extract.ndjson', RECORDS.map((r) => JSON.stringify(r)).join('\n') + '\n');

    const stubbed = proxyquire('../../stream/source', {
      './pbf': { parser: () => t.fail('pbf2json must not be used for a stored file') }
    });

    const seen = [];
    stubbed.createRecordStream({ file: file })
      .on('data', (record) => seen.push(record))
      .on('end', () => {
        t.deepEqual(seen, RECORDS, 'records are parsed from the file');
        t.end();
      });
  });

  test('a pbf is still parsed by pbf2json', function(t) {
    const conf = { file: '/data/planet-latest.osm.pbf', leveldb: '/data/leveldb' };
    let passed = null;

    const stubbed = proxyquire('../../stream/source', {
      './pbf': { parser: (conf) => { passed = conf; return 'pbf stream'; } }
    });

    t.equal(stubbed.createRecordStream(conf), 'pbf stream', 'the pbf2json stream is used');
    t.equal(passed, conf, 'config is passed through to the parser');
    t.end();
  });

  test('a compressed stored file is decompressed while reading', function(t) {
    const contents = RECORDS.map((r) => JSON.stringify(r)).join('\n') + '\n';
    const file = tempFile('pbf2json.pelias.jsonl.gz', zlib.gzipSync(Buffer.from(contents)));

    const seen = [];
    source.createRecordStream({ file: file })
      .on('data', (record) => seen.push(record))
      .on('end', () => {
        t.deepEqual(seen, RECORDS, 'records are parsed from the compressed file');
        t.end();
      });
  });

  test('a corrupt compressed file surfaces an error', function(t) {
    const file = tempFile('broken.jsonl.gz', Buffer.from('this is not gzip'));

    source.createRecordStream({ file: file })
      .on('data', () => {})
      .on('error', (err) => {
        t.ok(err, 'decompression error surfaces: ' + err.message);
        t.end();
      });
  });

  test('a malformed line fails the stream rather than being skipped', function(t) {
    const file = tempFile('broken.ndjson', '{"id":1}\nnot json\n');

    source.createRecordStream({ file: file })
      .on('data', () => {})
      .on('error', (err) => {
        t.ok(/failed to decode json/.test(err.message), 'decode error surfaces');
        t.end();
      });
  });
};

function importStream(filenames, parser) {
  return proxyquire('../../stream/source', {
    './pbf': { parser: parser },
    'pelias-config': {
      generate: () => ({
        imports: {
          openstreetmap: {
            datapath: '/data',
            leveldbpath: '/tmp',
            import: filenames.map((filename) => ({ filename: filename }))
          }
        }
      })
    }
  }).createImportStream();
}

function collect(readable, cb) {
  const records = [];
  readable.on('data', (record) => records.push(record));
  readable.on('end', () => cb(null, records));
  readable.on('error', (err) => cb(err, records));
}

module.exports.tests.importStream = function(test, common) {
  test('reads each file in order', function(t) {
    const opened = [];
    const readable = importStream(['a.pbf', 'b.pbf'], (conf) => {
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
    const readable = importStream(['a.pbf', 'b.pbf'], (conf) => {
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
    const readable = importStream(['a.pbf', 'b.pbf'], (conf) => {
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

  test('a missing file errors the stream', function(t) {
    const readable = importStream(['a.pbf', 'missing.pbf'], (conf) => {
      if (conf.file === '/data/missing.pbf') { throw new Error('failed to stat pbf file: ' + conf.file); }
      return stream.Readable.from([{ id: 1 }]);
    });

    collect(readable, (err, records) => {
      t.equal(err && err.message, 'failed to stat pbf file: /data/missing.pbf', 'error forwarded');
      t.deepEqual(records, [{ id: 1 }], 'records before the error');
      t.end();
    });
  });

  test('a file which closes without ending errors the stream', function(t) {
    const readable = importStream(['a.pbf', 'b.pbf'], () => {
      const closing = new stream.Readable({ objectMode: true, read: () => {} });
      closing.push({ id: 1 });
      setImmediate(() => closing.destroy());
      return closing;
    });

    collect(readable, (err, records) => {
      t.equal(err && err.code, 'ERR_STREAM_PREMATURE_CLOSE', 'premature close');
      t.deepEqual(records, [{ id: 1 }], 'records before the close');
      t.end();
    });
  });
};

module.exports.tests.byteStream = function(test, common) {
  test('the dispatcher gets raw bytes, unparsed', function(t) {
    const contents = RECORDS.map((r) => JSON.stringify(r)).join('\n') + '\n';
    const file = tempFile('extract.ldjson', contents);

    const chunks = [];
    source.createByteStream(file)
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => {
        t.equal(Buffer.concat(chunks).toString('utf8'), contents, 'bytes are passed through as-is');
        t.end();
      });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('source: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
