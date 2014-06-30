var should = require('should');
var osmread = require('../lib/main');
var http = require('http');

function portToLocalServerUrl(port){
    return 'http://localhost:' + port;
}

describe('when local http testserver is running', function(){
    var localHttpServer, parseNodes;
    
    beforeEach(function(done){
        setUpParsedNodes();
        setUpLocalHttpServer(done);
    });

    function setUpParsedNodes(){
        parsedNodes = [];
    }

    function setUpLocalHttpServer(done){
        localHttpServer = http.createServer(function(req, res){
            res.writeHead(200);

            res.end('<?xml version="1.0" encoding="UTF-8"?><osm version="0.6" generator="OpenStreetMap server"><node id="319408586" lat="51.5074089" lon="-0.1080108" version="1" changeset="440330" user="smsm1" uid="6871" visible="true" timestamp="2008-12-17T01:18:42Z"/></osm>');
        });

        localHttpServer.listen(done);
    }

    afterEach(function(){
        tearDownLocalHttpServer();
    });

    function tearDownLocalHttpServer(){
        localHttpServer.close();

        localHttpServer = null;
    }

    it('then parsing node from server parses node with id 319408586', function(done){
        osmread.parse({
            url: portToLocalServerUrl(localHttpServer.address().port),
            format: 'xml',
            endDocument: function(){
                parsedNodes[0].id.should.be.equal('319408586');

                return done();
            },
            node: function(node){
                parsedNodes.push(node);
            },
            error: function(msg){
                should.fail(msg);

                return done();
            }
        });
    });
});
