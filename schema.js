'use strict';

const Joi = require('joi');

// Schema Configuration
// datapath: string (required)
// leveldbpath: string (required)
// import: array of objects containing filename (optional)
// deduplicate: boolean (optional)
module.exports = Joi.object().keys({
  imports: Joi.object().keys({
    openstreetmap: Joi.object().keys({
      datapath: Joi.string(),
      leveldbpath: Joi.string(),
      import: Joi.array().items(Joi.object().keys({
        filename: Joi.string()
      }).requiredKeys('filename').unknown(true)),
      deduplicate: Joi.boolean()
    }).requiredKeys('datapath', 'leveldbpath', 'import').unknown(true)
  }).requiredKeys('openstreetmap').unknown(true)
}).requiredKeys('imports').unknown(true);
