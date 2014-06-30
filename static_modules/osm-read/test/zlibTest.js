var should = require('should');
var zlib = require('zlib');

describe('zlib', function(){
    
    it('deflate - inflate string should restore original string', function(done){
        var str;

        str = 'lorem ipsum dolor sit amet';

        zlib.deflate(new Buffer(str), function(err, compressed){
            zlib.inflate(compressed, function(err, output){
                output.toString().should.be.equal(str);

                return done();
            });
        });
    });

    it('deflate raw - inflate raw a string should restore original string', function(done){
        var str;

        str = 'lorem ipsum dolor sit amet';

        zlib.deflateRaw(new Buffer(str), function(err, compressed){
            zlib.inflateRaw(compressed, function(err, output){
                output.toString().should.be.equal(str);

                return done();
            });
        });

    });

});