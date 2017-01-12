'use strict';

const tape = require( 'tape' );
const configValidation = require( '../configValidation' );

module.exports.tests = {};

module.exports.tests.datapath = function(test, common) {
  test('missing imports should throw error', function(t) {
    [null, 17, 'string', [], true].forEach((value) => {
      const config = {};

      t.throws(function() {
        configValidation.validate(config);
      }, /"imports" is required/);
    });

    t.end();

  });

  test('non-object imports should throw error', function(t) {
    [null, 17, 'string', [], true].forEach((value) => {
      const config = {
        imports: value
      };

      t.throws(function() {
        configValidation.validate(config);
      }, /"imports" must be an object/);
    });

    t.end();

  });

  test('missing imports.openstreetmap should throw error', function(t) {
    const config = {
      imports: {
      }
    };

    t.throws(function() {
      configValidation.validate(config);
    }, /"openstreetmap" is required/);
    t.end();

  });

  test('non-object imports.openstreetmap should throw error', function(t) {
    [null, 17, 'string', [], true].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: value
        }
      };

      t.throws(function() {
        configValidation.validate(config);
      }, /"openstreetmap" must be an object/);
    });

    t.end();

  });

  test( 'missing datapath should throw error', function(t) {
    const config = {
      imports: {
        openstreetmap: {
          leveldbpath: 'leveldbpath value',
          import: []
        }
      }
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"datapath" is required/);

    t.end();
  });

  test( 'non-string datapath should throw error', function(t) {
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

      t.throws(() => {
        configValidation.validate(config);
      }, /"datapath" must be a string/);

    });

    t.end();
  });
};

module.exports.tests.leveldbpath = function(test, common) {
  test( 'missing leveldbpath should throw error', function(t) {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          import: []
        }
      }
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"leveldbpath" is required/);

    t.end();
  });

  test( 'non-string leveldbpath should throw error', function(t) {
    [null, 17, {}, [], false].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: value
          }
        }
      };

      t.throws(() => {
        configValidation.validate(config);
      }, /"leveldbpath" must be a string/);

    });

    t.end();
  });

};

module.exports.tests.import = function(test, common) {
  test( 'missing import should throw error', function(t) {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value'
        }
      }
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"import" is required/);

    t.end();
  });

  test( 'non-array import should throw error', function(t) {
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

      t.throws(() => {
        configValidation.validate(config);
      }, /"import" must be an array/);
    });

    t.end();
  });

  test( 'non-object elements in import array should throw error', function(t) {
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

      t.throws(() => {
        configValidation.validate(config);
      }, /"0" must be an object/, 'import elements must be objects');
    });

    t.end();
  });

  test( 'object elements in import array missing filename should throw error', function(t) {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          import: [{}]
        }
      }
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"filename" is required/, 'import elements must contain filename');

    t.end();
  });

  test( 'non-string filenames in import array should throw error', function(t) {
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

      t.throws(() => {
        configValidation.validate(config);
      }, /"filename" must be a string/);
    });

    t.end();
  });

};

module.exports.tests.adminLookup = function(test, common) {
  test( 'non-boolean adminLookup should throw error', function(t) {
    [null, 17, {}, [], 'string'].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: 'leveldbpath value',
            import: [],
            adminLookup: value
          }
        }
      };

      t.throws(() => {
        configValidation.validate(config);
      }, /"adminLookup" must be a boolean/);
    });

    t.end();
  });

};

module.exports.tests.deduplicate = function(test, common) {
  test( 'non-boolean deduplicate should throw error', function(t) {
    [null, 17, {}, [], 'string'].forEach((value) => {
      const config = {
        imports: {
          openstreetmap: {
            datapath: 'datapath value',
            leveldbpath: 'leveldbpath value',
            import: [],
            deduplicate: value
          }
        }
      };

      t.throws(() => {
        configValidation.validate(config);
      }, /"deduplicate" must be a boolean/);
    });

    t.end();
  });

};

module.exports.tests.unknowns = function(test, common) {
  test( 'unknown config fields should throw error', function(t) {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          import: [],
          unknown: 'value'
        }
      }
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"unknown" is not allowed/, 'unknown fields should be disallowed');
    t.end();

  });

};

module.exports.tests.valid = function(test, common) {
  test( 'configuration with only required fields should not throw error', function(t) {
    const config = {
      imports: {
        openstreetmap: {
          datapath: 'datapath value',
          leveldbpath: 'leveldbpath value',
          import: []
        }
      }
    };

    t.doesNotThrow(() => {
      configValidation.validate(config);
    }, 'config should be valid');
    t.end();

  });

  test( 'valid configuration with unknown fields in import objects should not throw error', function(t) {
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

    t.doesNotThrow(() => {
      configValidation.validate(config);
    }, 'config should be valid');
    t.end();

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('configValidation: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
