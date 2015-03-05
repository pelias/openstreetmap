
var tape = require('tape');
var common = {};

var tests = [
  // require('./stream/deprecated/any/buildHierarchy'),
  require('./stream/address_extractor'),
  require('./stream/dbmapper'),
  require('./stream/denormalizer.js'),
  require('./stream/pbf.js'),
  require('./stream/stats'),
  require('./mapper/item/osm_names')
];

tests.map(function(t) {
  t.all(tape, common);
});