var through = require('through2');

function sendPassthroughStream() {
  return through.obj(function (doc, enc, next) {
    next(null, doc);
  });
}
module.exports = sendPassthroughStream;
