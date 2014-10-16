
var address_mapper = require('../address_mapper');

var KARLSRUHE_SCHEMA = {
  'addr:housename':     'name',
  'addr:housenumber':   'number',
  'addr:street':        'street',
  'addr:state':         'state',
  'addr:postcode':      'zip',
  'addr:city':          'city',
  'addr:country':       'country'
};

module.exports = address_mapper(KARLSRUHE_SCHEMA);