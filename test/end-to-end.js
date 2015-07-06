
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
    naivedb = require('naivedb'),
    osm = require('../'),
    dbmapper = require('../stream/dbmapper');

var tmpfile = tmp.fileSync({ postfix: '.json' }).name,
    pbfPath = path.resolve(__dirname) + '/vancouver_canada.osm.pbf',
    expectedPath = path.resolve(__dirname) + '/fixtures/vancouver.extract.expected.json';

fs.writeFileSync( tmpfile, '{}' ); // init naivedb
var db = naivedb(tmpfile);

osm.pbf.parser({ file: pbfPath })
  .pipe( osm.doc.constructor() )
  .pipe( osm.tag.mapper() )
  .pipe( osm.doc.denormalizer() )
  .pipe( osm.address.extractor() )
  .pipe( osm.category.mapper( osm.category.defaults ) )
  .pipe( dbmapper() )
  .pipe( db.createWriteStream('_id') )
  .on('finish', function assert(){

    db.writeSync();

    var actual = JSON.parse( fs.readFileSync( tmpfile, { encoding: 'utf8' } ) ),
        expected = JSON.parse( fs.readFileSync( expectedPath, { encoding: 'utf8' } ) );

    var diff = deep.diff( actual, expected );

    if( diff ){
      console.log( diff );
      console.error( colors.red( 'end-to-end tests failed :(' ) );
      console.error( 'contents of', tmpfile, 'do not match expected:', expectedPath );
      process.exit(1);
    }

    console.error( colors.green( 'end-to-end tests passed :)' ) );
  });