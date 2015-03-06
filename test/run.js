
var tape = require('tape');
var common = {};

var tests = [
  require('./index'),
  require('./config/features'),
  require('./stream/address_extractor'),
  require('./stream/document_constructor'),
  require('./stream/dbmapper'),
  require('./stream/denormalizer'),
  require('./stream/pbf'),
  require('./stream/stats'),
  require('./mapper/item/osm_names')
];

tests.map(function(t) {
  t.all(tape, common);
});