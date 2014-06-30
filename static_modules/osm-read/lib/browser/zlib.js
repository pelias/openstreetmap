// don't use npm 'zlibjs' module, would require shims for the Node.js wrappers
var Zlib = require('../../node_modules/zlibjs/bin/inflate.min.js').Zlib;
var buf = require('./buffer.js');

function inflateBlob(blob, callback){
    var infl = new Zlib.Inflate(buf.blobDataToBuffer(blob.zlib_data), {
        bufferSize: blob.raw_size
    });
    return callback(null, infl.decompress());
}

module.exports = {
    inflateBlob: inflateBlob
};
