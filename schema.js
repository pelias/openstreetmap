'use strict';

const Joi = require('joi');

// Schema Configuration
// datapath: string (required)
// leveldbpath: string (required)
// import: array of objects containing filename (optional)
// importVenues: boolean (optional)
// download: array of objects containing sourceURL (optional)
// deduplicate: boolean (optional)
module.exports = Joi.object().keys({
  imports: Joi.object().keys({
    openstreetmap: Joi.object().keys({
      datapath: Joi.string(),
      leveldbpath: Joi.string(),
      import: Joi.array().items(Joi.object().keys({
        filename: Joi.string(),
        importVenues: Joi.boolean().default(true).truthy('yes').falsy('no').insensitive(true)
      }).requiredKeys('filename').unknown(true)),
      download: Joi.array().items(Joi.object().keys({
        sourceURL: Joi.string()
      }).requiredKeys('sourceURL').unknown(true)),
      deduplicate: Joi.boolean()
    }).requiredKeys('datapath', 'leveldbpath', 'import').unknown(true)
  }).requiredKeys('openstreetmap').unknown(true)
}).requiredKeys('imports').unknown(true);
