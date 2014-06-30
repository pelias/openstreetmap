var should = require('should');
var osmread = require('../lib/main');

describe('when manyNodes.pbf is parsed', function(){
    /*
     * this test makes sure that PBF files with many nodes can be parsed.
     */

    var parsedNodes;

    before(function(done){
        parsedNodes = [];

        osmread.parse({
            filePath: 'test/manyNodes.pbf',
            endDocument: function(){
                done();
            },
            node: function(node){
                parsedNodes.push(node);
            },
            error: function(msg){
                should.fail(msg);

                done();
            }
        });
    });
    
    it('then 3000 nodes are available', function(){
        parsedNodes.length.should.be.equal(3000);
    });
});
