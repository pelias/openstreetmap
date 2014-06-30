var fs = require('fs');
var buf = require('./buffer.js');

function bytesReadFail(callback, expectedBytes, readBytes){
    return callback(new Error('Expected ' + expectedBytes + ' bytes but got ' + readBytes));
}

function readBlobHeaderSize(fd, position, size, callback){
    var buffer;

    buffer = new Buffer(size);

    fs.read(fd, buffer, 0, size, position, function(err, bytesRead, buffer){
        if(bytesRead !== size){
            return bytesReadFail(callback, size, bytesRead);
        }

        return callback(null, buffer.readInt32BE(0));
    });
}

function readPBFElement(fd, position, size, pbfDecode, callback){
    var buffer;

    if(size > 32 * 1024 * 1024){
        return callback(new Error('PBF element too big: ' + size + ' bytes'));
    }

    buffer = new Buffer(size);

    fs.read(fd, buffer, 0, size, position, function(err, bytesRead, buffer){
        if(bytesRead !== size){
            return bytesReadFail(callback, size, bytesRead);
        }

        return buf.readPBFElementFromBuffer(buffer, pbfDecode, callback);
    });
}

function getFileSize(fd, callback){
    fs.fstat(fd, function(err, fdStatus){
        return callback(err, fdStatus.size);
    });
}

function open(opts, callback){
    fs.open(opts.filePath, 'r', callback);
}

function close(fd, callback){
    return fs.close(fd, callback);
}

module.exports = {
    readBlobHeaderSize: readBlobHeaderSize,
    readPBFElement: readPBFElement,
    getFileSize: getFileSize,
    open: open,
    close: close
};
