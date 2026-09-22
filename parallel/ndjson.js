'use strict';

/**
  Decodes a byte stream of newline delimited JSON into an object stream.
  Used by the parallel import workers to read the pbf2json output forwarded
  to them by the dispatcher.

  A line which fails to parse is fatal: it means the stream was truncated or
  the dispatcher mis-aligned a block boundary, and silently dropping records
  would produce an incomplete index.
**/

const { Transform } = require('stream');
const NEWLINE = 0x0a;

class NDJSONDecoder extends Transform {
  constructor() {
    super({ writableObjectMode: false, readableObjectMode: true });
    this.leftover = null;
  }

  _transform(chunk, enc, next) {
    const buf = this.leftover ? Buffer.concat([this.leftover, chunk]) : chunk;
    let start = 0;
    let idx = buf.indexOf(NEWLINE, start);

    while (idx !== -1) {
      const err = this.decode(buf.subarray(start, idx));
      if (err) { return next(err); }
      start = idx + 1;
      idx = buf.indexOf(NEWLINE, start);
    }

    this.leftover = start < buf.length ? buf.subarray(start) : null;
    next();
  }

  _flush(next) {
    const leftover = this.leftover;
    this.leftover = null;
    next(leftover ? this.decode(leftover) : null);
  }

  // returns an Error when the line is not valid JSON, else undefined
  decode(line) {
    if (!line.length) { return; }
    try {
      const obj = JSON.parse(line);
      if (obj) { this.push(obj); }
    } catch (e) {
      return new Error('failed to decode json: ' + line.toString('utf8').slice(0, 200));
    }
  }
}

module.exports.create = function () {
  return new NDJSONDecoder();
};
