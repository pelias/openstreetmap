function readPBFElementFromBuffer(buffer, pbfDecode, callback){
    return callback(null, pbfDecode(buffer));
}

function blobDataToBuffer(blob){
    return new Uint8Array(blob.toArrayBuffer());
}

module.exports = {
    readPBFElementFromBuffer: readPBFElementFromBuffer,
    blobDataToBuffer: blobDataToBuffer
};
