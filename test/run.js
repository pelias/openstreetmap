
var tape = require('tape');
var common = {};

var tests = [
  require('./util/centroidCodec')
];

tests.map(function(t) {
  t.all(tape, common);
});