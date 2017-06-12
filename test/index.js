'use strict';

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

// test exports
module.exports.tests.interface = (test, common) => {
  test('valid configuration should return function that gets called', (t) => {
    let importCalled = false;

    proxyquire('../index', {
      './schema': 'this is the schema',
      'pelias-config': {
        generate: (schema) => {
          // the schema passed to generate should be the require'd schema
          t.equals(schema, 'this is the schema');
        }
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

  test('existence of imports.openstreetmap.adminLookup should log deprecation message and still import', (t) => {
    let importCalled = false;
    const logger = require('pelias-mock-logger')();

    proxyquire('../index', {
      './schema': 'this is the schema',
      'pelias-config': {
        generate: (schema) => {
          // the schema passed to generate should be the require'd schema
          t.equals(schema, 'this is the schema');
          return {
            imports: {
              openstreetmap: {
                adminLookup: true
              }
            }
          };

        }
      },
      './stream/importPipeline': {
        import: () => {
          importCalled = true;
        }
      },
      'pelias-logger': logger
    });

    t.ok(logger.isInfoMessage(/^imports.openstreetmap.adminLookup has been deprecated/));
    t.ok(importCalled);
    t.end();

  });

  test('configValidation throwing error should rethrow', (t) => {
    t.throws(() => {
      proxyquire('../index', {
        './schema': 'this is the schema',
        'pelias-config': {
          generate: (schema) => {
            // the schema passed to generate should be the require'd schema
            t.equals(schema, 'this is the schema');

            throw Error('config is not valid');
          }
        }
      });

    }, /config is not valid/);

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape('importPipeline: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
