
/**
  End-to-end tests of a small pbf extract.

  The vancouver_canada.osm.pbf extract will be automatically downloaded before testing.
  @see: ./pretest.sh for more details, or run manually to download file.
**/

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    tmp = require('tmp'),
    deep = require('deep-diff'),
    streams = require('../'),
    model = require('pelias-model'),
    sink = require('through2-sink'),
    _ = require('lodash');

var pbfPath = path.resolve(__dirname) + '/vancouver_canada.osm.pbf',
    expectedPath = path.resolve(__dirname) + '/fixtures/vancouver.extract.expected.json';

var results = [];

console.log(pbfPath);

streams.pbfParser({ file: pbfPath })
  .pipe( streams.docConstructor() )
  .pipe( streams.tagMapper() )
  .pipe( streams.docDenormalizer() )
  .pipe( streams.addressExtractor() )
  .pipe( streams.categoryMapper( streams.config.categoryDefaults ) )
  .pipe( model.createDocumentMapperStream() )
  .pipe( sink.obj(function (doc) {
    results.push(doc);
  }) )
  .on('error', function error(err) {
    console.error('YIKES! Test failed with the following error: ', err.message);
    process.exit();
  })
  .on('finish', function assert(){

    var actual = results;
    var expected = JSON.parse( fs.readFileSync( expectedPath, { encoding: 'utf8' } ) );

    actual = _.sortBy(actual, ['_id', '_type']);
    expected = _.sortBy(expected, ['_id', '_type']);

    fs.writeFileSync('actual_output.json', JSON.stringify(actual, null, 2));
    fs.writeFileSync('expected_output.json', JSON.stringify(expected, null, 2));

    var i = 0;
    var countDiff = 0;
    var countSame = 0;

    while(i<actual.length) {
      var d = deep.diff(actual[i], expected[i]);
      if (d) {
        countDiff++;
      }
      else {
        countSame++;
      }
      i++;
    }
    var diff = deep.diff( actual, expected );

    if (!diff) {
      fs.unlinkSync('actual_output.json');
      fs.unlinkSync('expected_output.json');
    }

    if( diff ){
      //console.log( JSON.stringify(diff, null, 2) );
      console.log('actual count:', actual.length);
      console.log('expected count:', expected.length);
      console.log('matching count:', colors.green(countSame));
      console.log('difference count:', colors.red(countDiff));
      console.error( colors.red( 'end-to-end tests failed :(' ) );
      process.exit(1);
    }

    console.error( colors.green( 'end-to-end tests passed :)' ) );
  });
