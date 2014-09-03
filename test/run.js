
var tape = require('tape');
var common = {};

var tests = [
  require('./util/centroidCodec'),
  require('./stream/osm/any/buildHierachy')
];

tests.map(function(t) {
  t.all(tape, common);
});