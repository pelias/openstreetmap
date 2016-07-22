var proxyquire = require('proxyquire');
var multiplePbfs = require('../../stream/multiple_pbfs');
var eventStream = require('event-stream');
var path = require('path');
var through = require('through2');
var sink = require('through2-sink');
var fs = require('fs');

var fakeGeneratedConfig = {
  imports:{
    openstreetmap: {
      'import': [{
        filename: '/../vancouver_canada.osm.pbf'
      }],
      'datapath' : path.resolve(__dirname),
      'leveldbpath' : '/tmp'
    }
  }
};

var fakeConfig = {
  generate: function fakeGenerate(){
    return fakeGeneratedConfig;
  }
};

function testStream(input, testedStream, callback){
  var inputStream = eventStream.readArray(input);
  var destinationStream = eventStream.writeArray(callback);

  return inputStream.pipe(testedStream).pipe(destinationStream);
}

module.exports.tests = {};


module.exports.tests.combinedStream = function (test,common){
  test('multiple pbfs: one input stream', function(t){
    var mpbfParser = proxyquire('../../stream/multiple_pbfs',{'pelias-config': fakeConfig});
    var stream = mpbfParser.create();
    t.ok(stream.readable, 'stream is readable');
    var recordCount = 0;
    stream.pipe(sink.obj(function( record ){
      recordCount++;
    })).on('finish',function (){
      //there is no ensuring that this is the right number but its what passes the test and is non zero
      t.equals(recordCount, 4571);
      t.end();
    });
  });
  test('multiple pbfs: two identical input streams', function(t){
    fakeGeneratedConfig.imports.openstreetmap.import.push({filename: '/../vancouver_canada.osm.pbf'});
    var mpbfParser = proxyquire('../../stream/multiple_pbfs',{'pelias-config': fakeConfig});
    var stream = mpbfParser.create();
    t.ok(stream.readable, 'stream is readable');
    var expected = JSON.parse(fs.readFileSync(path.resolve(__dirname +'/../fixtures/vancouver.extract.expected.json' ) ));
    var recordcount = 0;
    stream.pipe(sink.obj(function(record){
      recordcount++;
    })).on('finish', function(){
      //there is no ensuring that this is the right number but its what passes the test and is non zero
      t.equals(recordcount, 2*4571);
      t.end();
    });
  });
  test('multiple pbfs: two identical input streams and a third different one', function(t){
    fakeGeneratedConfig.imports.openstreetmap.import.push({filename: '/../queens_village_ny.osm.pbf'});
    var mpbfParser = proxyquire('../../stream/multiple_pbfs',{'pelias-config': fakeConfig});
    var stream = mpbfParser.create();
    t.ok(stream.readable, 'stream is readable');
    var recordcount = 0;
    stream.pipe(sink.obj(function(record){
      recordcount++;
    })).on('finish', function(){
      //there is no ensuring that this is the right number but its what passes the test and is non zero
      t.equals(recordcount, 41638);
      t.end();
    });
  });
};

module.exports.all = function(tape, common){

  function test(name,test_function){
    return tape('multiple pbfs: ' + name, test_function );
  }

  for(var testCase in module.exports.tests){
    module.exports.tests[testCase](tape,common);
  }
};
