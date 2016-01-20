
var tape = require('tape');
var common = {};

var tests = [
  require('./index'),
  require('./config/features'),
  require('./config/localized_name_keys'),
  require('./stream/address_extractor'),
  require('./stream/document_constructor'),
  require('./stream/dbmapper'),
  require('./stream/denormalizer'),
  require('./stream/pbf'),
  require('./stream/stats'),
  require('./stream/tag_mapper'),
  require('./stream/category_mapper'),
  require('./config/category_map'),
  require('./stream/adminLookup'),
  require('./stream/deduper')
];

tests.map(function(t) {
  t.all(tape, common);
});