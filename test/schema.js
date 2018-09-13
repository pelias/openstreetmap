'use strict';

const tape = require( 'tape' );
const Joi = require('joi');
const schema = require( '../schema' );

function validate(config) {
  Joi.validate(config, schema, (err, value) => {
    if (err) {
      throw new Error(err.details[0].message);
    }
  });
}

module.exports.tests = {};

module.exports.tests.datapath = (test, common) => {
  test('missing imports should throw error', (t) => {
    [null, 17, 'string', [], true].forEach((value) => {
      const config = {};

      t.throws(validate.bind(null, config), /"imports" is required/);
    });

    t.end();

  });

  test('non-object imports should throw error', (t) => {
    [null, 17, 'string', [], true].forEach((value) => {
      const config = {
        imports: value
      };

      t.throws(validate.bind(null, config), /"imports" must be an object/);
    });

    t.end();

  });

  test('missing imports.openstreetmap should throw error', (t) => {
    const config = {
      imports: {
      }
    };

    t.throws(validate.bind(null, config), /"openstreetmap" is required/);
    t.end();

  });

  test('non-object imports.openstreetmap should throw error', (t) => {
    [null, 17, 'string', [], true].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: value
        }
      };

      t.throws(validate.bind(null, config), /"openstreetmap" must be an object/);
    });

    t.end();

  });

  test( 'missing datapath should throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          leveldbpath: 'leveldbpath value',
          import: []
        }
      }
    };

    t.throws(validate.bind(null, config), /"datapath" is required/);

    t.end();
  });

  test( 'non-string datapath should throw error', (t) => {
    [null, 17, {}, [], false].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: value,
            leveldbpath: 'leveldbpath value',
            import: []
          }
        }
      };

      t.throws(validate.bind(null, config), /"datapath" must be a string/);

    });

    t.end();
  });
};

module.exports.tests.leveldbpath = function(test, common) {
  test( 'missing leveldbpath should throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          import: []
        }
      }
    };

    t.throws(validate.bind(null, config), /"leveldbpath" is required/);

    t.end();
  });

  test( 'non-string leveldbpath should throw error', (t) => {
    [null, 17, {}, [], false].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: value
          }
        }
      };

      t.throws(validate.bind(null, config), /"leveldbpath" must be a string/);

    });

    t.end();
  });

};

module.exports.tests.import = function(test, common) {
  test( 'missing import should throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value'
        }
      }
    };

    t.throws(validate.bind(null, config), /"import" is required/);

    t.end();
  });

  test( 'non-array import should throw error', (t) => {
    [null, 17, {}, 'string', false].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: 'leveldbpath value',
            import: value
          }
        }
      };

      t.throws(validate.bind(null, config), /"import" must be an array/);
    });

    t.end();
  });

  test( 'non-object elements in import array should throw error', (t) => {
    [null, 17, 'string', [], false].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: 'leveldbpath value',
            import: [value]
          }
        }
      };

      t.throws(validate.bind(null, config), /"0" must be an object/, 'import elements must be objects');
    });

    t.end();
  });

  test( 'object elements in import array missing filename should throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          import: [{}]
        }
      }
    };

    t.throws(validate.bind(null, config), /"filename" is required/, 'import elements must contain filename');

    t.end();
  });

  test( 'non-string filenames in import array should throw error', (t) => {
    [null, 17, {}, [], false].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: 'leveldbpath value',
            import: [{
              filename: value
            }]
          }
        }
      };

      t.throws(validate.bind(null, config), /"filename" must be a string/);
    });

    t.end();
  });

};

module.exports.tests.unknowns = function(test, common) {
  test( 'imports.openstreetmap.adminLookup should not throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          import: [],
          adminLookup: true
        }
      }
    };

    t.doesNotThrow(validate.bind(null, config), 'deprecated adminLookup should be allowed');
    t.end();

  });

};

module.exports.tests.valid = function(test, common) {
  test( 'configuration with only required fields should not throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          import: []
        }
      }
    };

    t.doesNotThrow(validate.bind(null, config), 'config should be valid');
    t.end();

  });

  test( 'valid configuration with unknown fields in import objects should not throw error', (t) => {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          deduplicate: false,
          adminLookup: false,
          import: [
            {
              filename: 'file 1',
              type: {
                node: 'value 1',
                way: 'value 2'
              }
            },
            {
              filename: 'file 2'
            }
          ]
        }
      }
    };

    t.doesNotThrow(validate.bind(null, config), 'config should be valid');
    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('configValidation: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
