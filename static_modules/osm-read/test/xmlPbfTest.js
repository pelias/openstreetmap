var should = require('should');
var osmread = require('../lib/main');

function describeTest(filePath, describeFilePathSpecificTests){
    describe('when ' + filePath + ' is parsed', function(){
        var params;

        params = {};

        before(function(done){
            params.parsedBounds = [];
            params.parsedNodes = [];
            params.parsedWays = [];
            params.parsedRelations = [];

            osmread.parse({
                filePath: filePath,
                endDocument: function(){
                    done();
                },
                bounds: function(bounds){
                    params.parsedBounds.push(bounds);
                },
                node: function(node){
                    params.parsedNodes.push(node);
                },
                way: function(way){
                    params.parsedWays.push(way);
                },
                relation: function(relation){
                    params.parsedRelations.push(relation);
                },
                error: function(msg){
                    should.fail(msg);

                    done();
                }
            });
        });

        it('then node callback should deliver 6 nodes', function(){
            params.parsedNodes.length.should.be.equal(6);
        });

        it('then first parsed node has id 319408586', function(){
            params.parsedNodes[0].id.should.be.equal('319408586');
        });

        it('then first parsed node has lat 51.5074089', function(){
            params.parsedNodes[0].lat.should.be.within(51.507408, 51.507409);
        });

        it('then first parsed node has lon -0.1080108', function(){
            params.parsedNodes[0].lon.should.be.within(-0.108011, -0.108010);
        });

        it('then first parsed node has version 1', function(){
            params.parsedNodes[0].version.should.be.equal(1);
        });

        it('then first parsed node has changeset 440330', function(){
            params.parsedNodes[0].changeset.should.be.equal(440330);
        });

        it('then first parsed node has user smsm1', function(){
            params.parsedNodes[0].user.should.be.equal('smsm1');
        });

        it('then first parsed node has uid 6871', function(){
            params.parsedNodes[0].uid.should.be.equal('6871');
        });

        it('then third parsed node has name and is cafe', function(){
            var thirdNode = params.parsedNodes[2];

            thirdNode.tags.name.should.be.equal('Jam\'s Sandwich Bar');
            thirdNode.tags.amenity.should.be.equal('cafe');
        });

        it('then way callback should deliver 1 way', function(){
            params.parsedWays.length.should.be.equal(1);
        });

        it('then first way should start with the following node refs: 304994979, 319408587', function(){
            var nodeRefs;

            nodeRefs = params.parsedWays[0].nodeRefs;

            nodeRefs[0].should.be.equal('304994979');
            nodeRefs[1].should.be.equal('319408587');
        });

        it('then first relation\'s attributes are parsed', function(){
            var relation;

            relation = params.parsedRelations[0];

            relation.id.should.be.equal('56688');
            relation.user.should.be.equal('kmvar');
            relation.version.should.be.equal(28);
            relation.changeset.should.be.equal(6947637);
        });

        it('then first relation\'s tags are parsed', function(){
            var relation;

            relation = params.parsedRelations[0];

            relation.tags.network.should.be.equal('VVW');
            relation.tags.ref.should.be.equal('123');
            relation.tags.route.should.be.equal('bus');
            relation.tags.type.should.be.equal('route');
        });

        it('then first relation member is a node', function(){
            var nodeMember;

            nodeMember = params.parsedRelations[0].members[0];

            nodeMember.type.should.be.equal('node');
            nodeMember.ref.should.be.equal('319408586');
            nodeMember.role.should.be.equal('');
        });

        it('then second relation member is a way', function(){
            var nodeMember;

            nodeMember = params.parsedRelations[0].members[1];

            nodeMember.type.should.be.equal('way');
            nodeMember.ref.should.be.equal('27776903');
            nodeMember.role.should.be.equal('');
        });

        describeFilePathSpecificTests(params);
    });
}

describe('osmread', function(){
    describe('when xml with invalid syntax is parsed', function(){
        it('then an error should be raised', function(done){
            osmread.parse({
                filePath: 'test/invalid.xml',
                error: function(msg){
                    done();
                }
            });
        });
    });

    describe('when parsed xml file not exists', function(){
        it('then an error should be raised', function(done){
            osmread.parse({
                filePath: 'this/path/should/not/exist.xml',
                error: function(msg){
                    done();
                }
            });
        });
    });

    describeTest('test/test.xml', function(params){
        it('then bounds callback should min and max lat and long', function(){
            /*
             * This test currently only works for test.xml because the bounds
             * information is not parsed in the test.pbf. The cause for this
             * is not yet clear to me. My guesses are one of the following:
             * a) osmosis did not convert the bounds from test.xml to test.pbf
             * b) protobufjs did not parse the bounds from test.pbf
             */

            var bounds = params.parsedBounds[0];

            bounds.minlat.should.be.within(51.507360179555, 51.507360179556);
        });

        it('then first parsed node is visible', function(){
            /*
             * This test currently only works for test.xml because the visible
             * information is not parsed in the test.pbf. The cause for this
             * is not yet clear to me. My guesses are one of the following:
             * a) osmosis did not convert the visible flags from test.xml to test.pbf
             * b) protobufjs did not parse the visible flags from test.pbf
             */
            
            params.parsedNodes[0].visible.should.be.equal(true);
        });

        it('then first parsed relation is visible', function(){
            /*
             * This test currently only works for test.xml because the visible
             * information is not parsed in the test.pbf. The cause for this
             * is not yet clear to me. My guesses are one of the following:
             * a) osmosis did not convert the visible flags from test.xml to test.pbf
             * b) protobufjs did not parse the visible flags from test.pbf
             */

            params.parsedRelations[0].visible.should.be.equal(true);
        });
    });

    describeTest('test/test.pbf', function(parsedBounds, parsedNodes, parsedWays){
    });
});
