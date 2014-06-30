var should = require('should');
var osmread = require('../lib/main');

describe('pbf read', function(){
    
    describe('when parser for test.pbf exists', function(){
        var parser;
        
        before(function(done){
            osmread.createPbfParser({
                filePath: 'test/test.pbf',
                callback: function(err, p){
                    if(err){
                        should.fail();
                        return done();
                    }

                    parser = p;

                    return done();
                }
            });
        });

        after(function(done){
            parser.close(function(err){
                if(err){
                    should.fail();
                    return done();
                }

                return done();
            });
        });

        it('has one OSMHeader', function(){
            var blocks = parser.findFileBlocksByBlobType('OSMHeader');

            blocks.length.should.be.equal(1);
        });

        describe('and first OSMHeader exists', function(){
            var osmHeaderBlock, osmHeader;

            before(function(done){
                osmHeaderBlock = parser.findFileBlocksByBlobType('OSMHeader')[0];
                parser.readBlock(osmHeaderBlock, function(err, block){
                    if(err){
                        should.fail();

                        return done();
                    }

                    osmHeader = block;

                    return done();
                });
            });

            it('then writingprogram is "0.40.1"', function(){
                osmHeader.writingprogram.should.be.equal('0.40.1');
            });
        });

        it('has one OSMData', function(){
            var blocks = parser.findFileBlocksByBlobType('OSMData');

            blocks.length.should.be.equal(1);
        });

        describe('and first OSMData exists', function(){
            var osmDataBlock, osmData;

            before(function(done){
                osmDataBlock = parser.findFileBlocksByBlobType('OSMData')[0];
                parser.readBlock(osmDataBlock, function(err, block){
                    if(err){
                        should.fail();

                        return done();
                    }

                    osmData = block;

                    return done();
                });
            });

            it('then second stringtable entry is smsm1', function(){
                osmData.stringtable.getEntry(2).should.be.equal('smsm1');
            });

            it('then granulatiry is 100', function(){
                osmData.granularity.should.be.equal(100);
            });

            it('then three primitivegroups exist', function(){
                osmData.primitivegroup.length.should.be.equal(3);
            });

            it('then second primitivegroup has 0 nodes', function(){
                osmData.primitivegroup[1].nodesView.length.should.be.equal(0);
            });

            describe('and first primitivegroup exists', function(){
                var pg;

                before(function(){
                    pg = osmData.primitivegroup[0];
                });

                it('then pg has 6 nodes', function(){
                    pg.nodesView.length.should.be.equal(6);
                });

                it('then first node has latitude 51.5074089', function(){
                    pg.nodesView.get(0).lat.should.be.equal(51.5074089);
                });

                it('then first node has longitude -0.1080108', function(){
                    pg.nodesView.get(0).lon.should.be.equal(-0.1080108);
                });

                it('then first node has id 319408586', function(){
                    pg.nodesView.get(0).id.should.be.equal('319408586');
                });

                it('then first node has timestamp 1229476722000 (2008-12-17T01:18:42Z)', function(){
                    pg.nodesView.get(0).timestamp.should.be.equal(1229476722000);
                });

                it('then second node has latitude 51.5074343', function(){
                    pg.nodesView.get(1).lat.should.be.equal(51.5074343);
                });

                it('then second node has longitude -0.1081264', function(){
                    pg.nodesView.get(1).lon.should.be.equal(-0.1081264);
                });

                it('then second node has id 319408587', function(){
                    pg.nodesView.get(1).id.should.be.equal('319408587');
                });

                it('then third node has tag amenity=cafe', function(){
                    pg.nodesView.get(2).tags.amenity.should.be.equal('cafe');
                });

                it('then last node has latitude 51.507406', function(){
                    pg.nodesView.get(pg.nodesView.length - 1).lat.should.be.equal(51.507406);
                });

                it('then last node has longitude -0.1083348', function(){
                    pg.nodesView.get(pg.nodesView.length - 1).lon.should.be.equal(-0.1083348);
                });

                it('then last node\'s tags should be defined', function(){
                    should.exist(pg.nodesView.get(pg.nodesView.length - 1).tags);
                });
            });

            describe('and second primitivegroup exists', function(){
                var pg;

                before(function(){
                    pg = osmData.primitivegroup[1];
                });

                it('then pg has one way', function(){
                    pg.waysView.length.should.be.equal(1);
                });

                describe('and first way exists', function(){
                    var way;

                    before(function(){
                        way = pg.waysView.get(0);
                    });

                    it('then way has id 27776903', function(){
                        way.id.should.be.equal('27776903');
                    });

                    it('then way has version 3', function(){
                        way.version.should.be.equal(3);
                    });

                    it('then way has timestamp 1243777155000 (2009-05-31T13:39:15Z)', function(){
                        way.timestamp.should.be.equal(1243777155000);
                    });

                    it('then way has changeset 1368552', function(){
                        way.changeset.should.be.equal(1368552);
                    });

                    it('then way has user Matt', function(){
                        way.user.should.be.equal('Matt');
                    });

                    it('then way has uid 70', function(){
                        way.uid.should.be.equal('70');
                    });

                    it('then way has tag highway=service', function(){
                        way.tags.highway.should.be.equal('service');
                    });

                    it('then way has tag name=üßé€', function(){
                        way.tags.name.should.be.equal('üßé€');
                    });

                    it('then first way node ref has id 304994979', function(){
                        way.nodeRefs[0].should.be.equal('304994979');
                    });

                    it('then second way node ref has id 319408587', function(){
                        way.nodeRefs[1].should.be.equal('319408587');
                    });

                });
            });

        });

    });

});
