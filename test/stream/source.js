'use strict';

const fs = require('fs');
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
