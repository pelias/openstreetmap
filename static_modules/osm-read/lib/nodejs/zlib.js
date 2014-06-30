var zlib = require('zlib');
var buf = require('./buffer.js');

function inflateBlob(blob, callback){
    zlib.inflate(buf.blobDataToBuffer(blob.zlib_data), callback);
}

module.exports = {
    inflateBlob: inflateBlob
};