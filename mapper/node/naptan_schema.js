
// http://wiki.openstreetmap.org/wiki/NaPTAN

var address_mapper = require('../address_mapper');

var NAPTAN_SCHEMA = {
  'naptan:Street':    'street'
};

module.exports = address_mapper(NAPTAN_SCHEMA);