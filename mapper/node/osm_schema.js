
var address_mapper = require('../address_mapper');

var OSM_SCHEMA = {
  'postal_code':      'zip'
};

module.exports = address_mapper(OSM_SCHEMA);