var should = require('should');
var osmread = require('../lib/main');

describe('osmread getFileType', function(){
    it('returns "xml" for path "test.xml"', function(){
        osmread.getFileType('test.xml').should.be.equal('xml');
    });

    it('returns "pbf" for path "test.pbf"', function(){
        osmread.getFileType('test.pbf').should.be.equal('pbf');
    });

    it('throws exception on unknown file type', function(){
        (function(){
            osmread.getFileType('somethingUnknown');
        }).should.throw();
    });
});