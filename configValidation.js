'use strict';

const Joi = require('joi');

// Schema Configuration
// datapath: string (required)
// leveldbpath: string (required)
// import: array of objects containing filename (optional)
// deduplicate: boolean (optional)
// adminLookup: boolean (optional)
const schema = Joi.object().keys({
  imports: Joi.object().keys({
    openstreetmap: Joi.object().keys({
      datapath: Joi.string(),
      leveldbpath: Joi.string(),
      import: Joi.array().items(Joi.object().keys({
        filename: Joi.string()
      }).requiredKeys('filename').unknown(true)),
      deduplicate: Joi.boolean(),
      adminLookup: Joi.boolean()
    }).requiredKeys('datapath', 'leveldbpath', 'import').unknown(false)
  }).requiredKeys('openstreetmap').unknown(true)
}).requiredKeys('imports').unknown(true);

module.exports = {
  validate: function validate(config) {
    Joi.validate(config, schema, (err) => {
      if (err) {
        throw new Error(err.details[0].message);
      }
    });
  }

};
