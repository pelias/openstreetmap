'use strict';

/**
  Parallel import dispatcher.

  Reading a pbf file cannot be parallelized, but everything downstream of the
  parser is stateless per record, so a single pbf2json reader can feed any
  number of import pipelines. This module runs that reader and forwards its
  output, split on line boundaries, to N worker processes.

  Blocks are handed to whichever worker is currently accepting writes, so a
  worker blocked on Elasticsearch does not stall the reader. When every worker
  is busy the reader is paused, which propagates backpressure to pbf2json.

  Only used when imports.openstreetmap.parallelism is greater than 1.
**/

const child = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const logger = require('pelias-logger').get('openstreetmap');
const settings = require('pelias-config').generate(require('../schema'));
const pbf = require('../stream/pbf');
const generateParams = require('pbf2json/lib/generateParams');

const NEWLINE = 0x0a;
const WORKER_PATH = path.join(__dirname, 'worker.js');
const PBF2JSON_BIN = path.join(
  path.dirname(require.resolve('pbf2json')),
  'build',
  `pbf2json.${os.platform()}-${os.arch()}`
);

function run(parallelism) {
  const configs = pbfConfigs();
  const state = { shuttingDown: false, exitCode: 0, workers: [], reader: null };

  state.workers = startWorkers(parallelism, state);
  const dispatcher = createDispatcher(state.workers);

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      state.shuttingDown = true;
      killChildren(state);
      process.exit(1);
    });
  });

  readSequentially(configs, dispatcher, state, () => {
    logger.info('pbf parsing complete, waiting for workers to flush');
    state.shuttingDown = true;
    dispatcher.end();
  });
}

// generate one pbf2json config per configured import file
function pbfConfigs() {
  const osm = settings.imports.openstreetmap;

  return osm.import.map((entry) => {
    const conf = pbf.config({
      file: path.join(osm.datapath, entry.filename),
      leveldb: osm.leveldbpath,
      importVenues: entry.importVenues
    });

    [conf.file, conf.leveldb].forEach((target) => {
      try {
        fs.statSync(target);
      } catch (e) {
        throw new Error('failed to stat path: ' + target);
      }
    });

    return conf;
  });
}

function startWorkers(parallelism, state, workerPath) {
  const workers = [];

  for (let id = 0; id < parallelism; id++) {
    workers.push(spawnWorker(id, workers, state, workerPath || WORKER_PATH));
  }

  logger.info(`started ${parallelism} import workers`);
  return workers;
}

function spawnWorker(id, workers, state, workerPath) {
  const proc = child.spawn(process.execPath, process.execArgv.concat(workerPath), {
    stdio: ['pipe', 'inherit', 'inherit'],
    env: Object.assign({}, process.env, { PELIAS_OSM_WORKER_ID: String(id) })
  });

  const worker = { id: id, proc: proc, ready: true, alive: true };

  // a closed stdin surfaces as the exit below, no need to also throw here
  proc.stdin.on('error', () => {});

  proc.on('exit', (code, signal) => {
    worker.alive = false;
    worker.ready = false;

    if (!state.shuttingDown) {
      fatal(state, `worker ${id} exited early (code ${code}, signal ${signal})`);
      return;
    }

    if (code !== 0) {
      logger.error(`worker ${id} exited with code ${code}, signal ${signal}`);
      state.exitCode = 1;
    }

    if (workers.every((w) => !w.alive)) {
      logger.info('import complete');
      process.exit(state.exitCode);
    }
  });

  return worker;
}

function createDispatcher(workers) {
  let cursor = 0;
  let leftover = null;
  let source = null;
  let paused = false;

  // round robin over the workers currently accepting writes
  function claim() {
    let fallback = null;

    for (let i = 0; i < workers.length; i++) {
      const worker = workers[(cursor + i) % workers.length];
      if (!worker.alive) { continue; }
      if (worker.ready) {
        cursor = (cursor + i + 1) % workers.length;
        return worker;
      }
      fallback = fallback || worker;
    }

    // every worker is busy, buffer into one of them rather than dropping the
    // block: the reader is paused immediately after this write
    return fallback;
  }

  function resume() {
    if (paused && source) {
      paused = false;
      source.resume();
    }
  }

  function send(block) {
    const worker = claim();
    if (!worker) { return; }

    const wasReady = worker.ready;

    if (worker.proc.stdin.write(block)) {
      worker.ready = true;
    } else if (wasReady) {
      worker.ready = false;
      worker.proc.stdin.once('drain', () => {
        worker.ready = true;
        resume();
      });
    }
  }

  function onData(chunk) {
    const buf = leftover ? Buffer.concat([leftover, chunk]) : chunk;
    const idx = buf.lastIndexOf(NEWLINE);

    // no complete line yet, keep accumulating
    if (idx === -1) {
      leftover = buf;
      return;
    }

    leftover = idx + 1 < buf.length ? Buffer.from(buf.subarray(idx + 1)) : null;
    send(buf.subarray(0, idx + 1));

    if (source && !workers.some((worker) => worker.ready)) {
      paused = true;
      source.pause();
    }
  }

  return {
    attach: (stdout) => {
      source = stdout;
      paused = false;
      stdout.on('data', onData);
    },
    end: () => {
      if (leftover && leftover.length) {
        send(Buffer.concat([leftover, Buffer.from('\n')]));
        leftover = null;
      }
      workers.forEach((worker) => {
        if (worker.alive) { worker.proc.stdin.end(); }
      });
    }
  };
}

function readSequentially(configs, dispatcher, state, done) {
  let index = 0;

  (function next() {
    if (index >= configs.length) { return done(); }

    const conf = configs[index++];
    logger.info('Creating read stream for: ' + conf.file);

    const proc = child.spawn(PBF2JSON_BIN, generateParams(conf), {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    proc.stderr.on('data', (data) => {
      data.toString('utf8').trim().split('\n').forEach((line) => {
        if (line.indexOf('[info]') === -1 && line.indexOf('[warn]') === -1) {
          logger.error('[pbf2json]: ' + line);
        }
      });
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return fatal(state, 'pbf2json exited with code ' + code);
      }
      next();
    });

    state.reader = proc;
    dispatcher.attach(proc.stdout);
  })();
}

function killChildren(state) {
  if (state.reader) { state.reader.kill(); }
  state.workers.forEach((worker) => {
    if (worker.alive) { worker.proc.kill(); }
  });
}

function fatal(state, message) {
  logger.error(message);
  state.shuttingDown = true;
  killChildren(state);
  process.exit(1);
}

module.exports.run = run;

// exported for testing
module.exports.createDispatcher = createDispatcher;
module.exports.startWorkers = startWorkers;
module.exports.readSequentially = readSequentially;
