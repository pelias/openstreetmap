
var tape = require('tape');
var common = {};

var tests = [
  require('./util/centroidCodec'),
  require('./stream/osm/any/buildHierarchy'),
  require('./stream/node_filter'),
  require('./stream/address_extractor'),
  require('./stream/stats'),
  require('./stream/osm_types'),
  require('./mapper/node/osm_names')
];

tests.map(function(t) {
  t.all(tape, common);
});