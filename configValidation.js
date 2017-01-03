'use strict';

const Joi = require('joi');

// Schema Configuration
// datapath: string (required)
// import: array of objects containing filename
// deduplicate: boolean
// adminLookup: boolean
const schema = Joi.object().keys({
  datapath: Joi.string(),
  import: Joi.array().items(Joi.object().keys({
    filename: Joi.string()
  }).requiredKeys('filename').unknown(true)),
  leveldbpath: Joi.string(),
  deduplicate: Joi.boolean(),
  adminLookup: Joi.boolean()
}).requiredKeys('datapath').unknown(false);

module.exports = {
  validate: function validate(config) {
    Joi.validate(config, schema, (err) => {
      if (err) {
        throw new Error(err.details[0].message);
      }
    });
  }

};
