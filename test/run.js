
var tape = require('tape');
var common = {};

var tests = [
  require('./schema'),
  require('./index'),
  require('./config/category_map'),
  require('./config/features'),
  require('./config/localized_name_keys'),
  require('./stream/address_extractor'),
  require('./stream/category_mapper'),
  require('./stream/addendum_mapper'),
  require('./stream/popularity_mapper'),
  require('./stream/document_constructor'),
  require('./stream/importPipeline'),
  require('./stream/pbf'),
  require('./stream/stats'),
  require('./stream/tag_mapper')
];

tests.map(function(t) {
  t.all(tape, common);
});
