// Browser only
if (typeof self !== 'undefined') {

    var should = window.Should;
    var ByteBuffer = dcodeIO.ByteBuffer;

    describe('zlib.js', function(){

        it('inflate string should restore original string', function(){
            var str;

            str = 'lorem ipsum dolor sit amet';
            var bb = ByteBuffer.wrap(str, 'utf8');
            var buf = new Uint8Array(bb.toArrayBuffer());
            var compressed = new Zlib.Deflate(buf).compress();
            var blob = ByteBuffer.wrap(compressed);
            //blob.printDebug();

            buf = new Uint8Array(blob.toArrayBuffer());
            var decompressed = new Zlib.Inflate(buf, {
                bufferSize: bb.length
            }).decompress();
            var output = ByteBuffer.wrap(decompressed).toUTF8();

            output.should.be.equal(str);
        });
    });
}
