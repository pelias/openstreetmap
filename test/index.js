'use strict';

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

// test exports
module.exports.tests.interface = function(test, common) {
  test('valid configuration should return function that gets called', function(t) {
    let importCalled = false;

    proxyquire('../index', {
      './configValidation': {
        // validate doesn't throw an error
        validate: () => {}
      },
      './stream/importPipeline': {
        import: () => {
          importCalled = true;
        }
      }
    });

    t.ok(importCalled);
    t.end();

  });

  test('configValidation throwing error should rethrow', function(t) {
    t.throws(function() {
      proxyquire('../index', {
        './configValidation': {
          validate: () => {
            throw Error('config is not valid');
          }
        }
      });

    }, /config is not valid/);

    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('importPipeline: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
