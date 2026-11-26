'use strict';

const stream = require('stream');
var isObject = require('is-object');
const importPipeline = require('../../stream/importPipeline');

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  var streams = [
    'pbfParser',
    'docConstructor',
    'blacklistStream',
    'addressesWithoutStreet',
    'tagMapper',
    'adminLookup',
    'addressExtractor',
    'venueFilter',
    'categoryMapper',
    'addendumMapper',
    'popularityMapper',
    'dbMapper',
    'elasticsearch',
    'import'
  ];

  streams.forEach(function (stream) {
    test('interface: ' + stream, function(t) {
      t.equal(typeof importPipeline[stream], 'function', 'stream factory');
      t.end();
    });
  });

  test('interface: stream count', function(t) {
    t.equal( Object.keys(importPipeline).length, streams.length + 1, 'correct number of streams');
    t.end();
  });

  test('interface: importPipeline.config.categoryDefaults', function(t) {
    t.true(isObject( importPipeline.config.categoryDefaults ), 'default mapping object');
    t.end();
  });
};

const STAGES = [
  'docConstructor',
  'addressesWithoutStreet',
  'tagMapper',
  'addressExtractor',
  'venueFilter',
  'blacklistStream',
  'categoryMapper',
  'addendumMapper',
  'popularityMapper',
  'adminLookup',
  'dbMapper'
];

function stubPipeline(onRecord, onFinish) {
  const originals = {};
  STAGES.concat('elasticsearch').forEach((stage) => {
    originals[stage] = importPipeline[stage];
  });

  STAGES.forEach((stage) => {
    importPipeline[stage] = () => new stream.PassThrough({ objectMode: true });
  });
  importPipeline.elasticsearch = () => new stream.Writable({
    objectMode: true,
    write: (record, enc, next) => { onRecord(record); next(); },
    final: (next) => { onFinish(); next(); }
  });

  return () => Object.assign(importPipeline, originals);
}

function stubExit(onExit) {
  const exit = process.exit;
  process.exit = (code) => { process.exit = exit; onExit(code); };
  return () => { process.exit = exit; };
}

module.exports.tests.import = function(test, common) {
  test('import: records reach elasticsearch without exiting', function(t) {
    const records = [];
    const restoreExit = stubExit(() => t.fail('process.exit called'));
    const restorePipeline = stubPipeline((record) => records.push(record), () => {
      setImmediate(() => {
        restorePipeline();
        restoreExit();
        t.deepEqual(records, [{ id: 1 }, { id: 2 }], 'all records indexed');
        t.end();
      });
    });

    importPipeline.import(stream.Readable.from([{ id: 1 }, { id: 2 }]));
  });

  test('import: source error exits non-zero', function(t) {
    const restorePipeline = stubPipeline(() => {}, () => t.fail('pipeline finished'));
    stubExit((code) => {
      restorePipeline();
      t.equal(code, 1, 'exit code');
      t.end();
    });

    const source = new stream.Readable({ objectMode: true, read: () => {} });
    importPipeline.import(source);
    source.push({ id: 1 });
    source.destroy(new Error('pbf2json was terminated by signal SIGKILL'));
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('importPipeline: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
