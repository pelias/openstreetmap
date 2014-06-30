function toArrayBuffer(buffer) {
    /*
     * took this function from
     * http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
     */
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function readPBFElementFromBuffer(buffer, pbfDecode, callback){
    return callback(null, pbfDecode(toArrayBuffer(buffer)));
}

function pbfBufferToBuffer(src, srcOffset, len){
    var from, to, i;

    from = src.view;
    to = new Buffer(len);

    for(i = 0; i < len; ++i){
        to.writeUInt8(from.getUint8(i + srcOffset), i);
    }

    return to;
}

function blobDataToBuffer(blob){
    var from, len, offset;

    from = blob.view;

    // TODO find out where the offset comes from!?!
    offset = 0; //6; // 4
    for(offset = 0; offset < from.byteLength - 1; ++offset){
        if(from.getUint16(offset) === 0x789c){
            break;
        }
    }

    len = from.byteLength - offset;

    return pbfBufferToBuffer(blob, offset, len);
}

module.exports = {
    readPBFElementFromBuffer: readPBFElementFromBuffer,
    blobDataToBuffer: blobDataToBuffer
};
