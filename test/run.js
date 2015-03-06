
var tape = require('tape');
var common = {};

var tests = [
  require('./index'),
  require('./config/features'),
  require('./stream/address_extractor'),
  require('./stream/dbmapper'),
  require('./stream/denormalizer'),
  require('./stream/pbf'),
  require('./stream/stats'),
  require('./mapper/item/osm_names')
  // require('./stream/deprecated/any/buildHierarchy'),
];

tests.map(function(t) {
  t.all(tape, common);
});