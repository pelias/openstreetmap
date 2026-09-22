'use strict';

const { Writable, PassThrough } = require('stream');
const dispatcher = require('../../parallel/dispatcher');

module.exports.tests = {};

// a worker stdin which only accepts writes while unblocked, so tests can
// simulate a pipeline stalled on elasticsearch
function fakeWorker(id) {
  const pending = [];
  const stdin = new Writable({
    highWaterMark: 1,
    write: function(chunk, enc, next) {
      worker.received.push(chunk.toString('utf8'));
      if (worker.blocked) { pending.push(next); } else { next(); }
    }
  });

  const worker = {
    id: id,
    proc: { stdin: stdin },
    ready: true,
    alive: true,
    blocked: false,
    received: [],
    ended: false,
    release: function() {
      worker.blocked = false;
      while (pending.length) { pending.shift()(); }
    }
  };

  stdin.on('finish', () => { worker.ended = true; });
  return worker;
}

function setup(count) {
  const workers = [];
  for (let i = 0; i < count; i++) { workers.push(fakeWorker(i)); }
  const source = new PassThrough();
  const instance = dispatcher.createDispatcher(workers);
  instance.attach(source);
  return { workers: workers, source: source, dispatcher: instance };
}

module.exports.tests.fanout = function(test, common) {
  test('every record is delivered exactly once, to a single worker', function(t) {
    const ctx = setup(3);
    const lines = [];
    for (let i = 0; i < 300; i++) { lines.push(`{"id":${i}}`); }

    // write in chunks which deliberately end mid-line
    const payload = lines.join('\n') + '\n';
    for (let i = 0; i < payload.length; i += 37) {
      ctx.source.write(Buffer.from(payload.slice(i, i + 37)));
    }
    ctx.dispatcher.end();

    const received = ctx.workers
      .map((worker) => worker.received.join(''))
      .join('')
      .trim()
      .split('\n');

    t.equal(received.length, lines.length, 'no records lost or duplicated');
    t.deepEqual(received.slice().sort(), lines.slice().sort(), 'records intact');
    t.end();
  });

  test('records are spread across all workers', function(t) {
    const ctx = setup(3);
    for (let i = 0; i < 30; i++) { ctx.source.write(Buffer.from(`{"id":${i}}\n`)); }

    ctx.workers.forEach((worker) => {
      t.ok(worker.received.length > 0, `worker ${worker.id} received work`);
    });
    t.end();
  });

  test('a blocked worker stops receiving work', function(t) {
    const ctx = setup(2);
    ctx.workers[0].blocked = true;

    for (let i = 0; i < 40; i++) { ctx.source.write(Buffer.from(`{"id":${i}}\n`)); }

    const blocked = ctx.workers[0].received.length;
    t.ok(blocked > 0, 'blocked worker received the write which stalled it');
    t.ok(ctx.workers[1].received.length > blocked, 'remaining work went elsewhere');
    t.end();
  });

  test('source is paused when every worker is blocked, resumed on drain', function(t) {
    const ctx = setup(2);
    ctx.workers.forEach((worker) => { worker.blocked = true; });

    for (let i = 0; i < 40; i++) { ctx.source.write(Buffer.from(`{"id":${i}}\n`)); }
    t.equal(ctx.source.isPaused(), true, 'reader paused while workers are full');

    ctx.workers[0].release();
    setImmediate(() => {
      t.equal(ctx.source.isPaused(), false, 'reader resumed once a worker drained');
      t.end();
    });
  });

  test('end flushes a trailing line and closes every worker', function(t) {
    const ctx = setup(2);
    ctx.source.write(Buffer.from('{"id":1}\n{"id":2}'));
    ctx.dispatcher.end();

    const received = ctx.workers.map((worker) => worker.received.join('')).join('');
    t.equal(received.split('\n').filter(Boolean).length, 2, 'trailing line flushed');

    setImmediate(() => {
      ctx.workers.forEach((worker) => {
        t.equal(worker.ended, true, `worker ${worker.id} stdin ended`);
      });
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('dispatcher: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
