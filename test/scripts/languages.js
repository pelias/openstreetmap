
var buildLanguages = require('../../scripts/generate_languages');
var snapshot = require('../../scripts/languages.json');

module.exports.tests = {};

// scripts/languages.json is committed so that scripts/generate_taginfo.js can run
// without node_modules; this test ensures it hasn't drifted from iso-639-3
module.exports.tests.snapshot = function(test, common) {
  test('snapshot is in sync', function(t) {
    t.deepEqual(snapshot, buildLanguages(),
      'scripts/languages.json is out of date, run `npm run languages`');
    t.end();
  });

  test('interface', function(t) {
    t.true(Object.keys(snapshot).length > 100, 'contains language codes');
    t.equal(snapshot.en, 'English', 'maps code to language name');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('languages: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
