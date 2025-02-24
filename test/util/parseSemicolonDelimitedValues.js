const parseSemicolonDelimitedValues = require('../../util/parseSemicolonDelimitedValues');

module.exports.tests = {};

// test exports
module.exports.tests.smoke = function (test, common) {
  test('interface', t => {
    t.equal(typeof parseSemicolonDelimitedValues, 'function', 'function');
    t.end();
  });
  test('parse - invalid', t => {
    t.deepEqual(parseSemicolonDelimitedValues(1), []);
    t.deepEqual(parseSemicolonDelimitedValues(['a']), []);
    t.deepEqual(parseSemicolonDelimitedValues([{'a': 'b'}]), []);
    t.deepEqual(parseSemicolonDelimitedValues(undefined), []);
    t.deepEqual(parseSemicolonDelimitedValues(null), []);
    t.deepEqual(parseSemicolonDelimitedValues(''), []);
    t.end();
  });
  test('parse - examples', t => {
    t.deepEqual(parseSemicolonDelimitedValues(''), []);
    t.deepEqual(parseSemicolonDelimitedValues(' '), []);
    t.deepEqual(parseSemicolonDelimitedValues(' ;; ; ; ; ; ;; ; ;; '), []);
    t.deepEqual(parseSemicolonDelimitedValues(' a; b ;;; ; '), ['a', 'b']);
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('parseSemicolonDelimitedValues: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
