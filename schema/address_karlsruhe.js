
/**
  Attempt to map OSM address tags to the Pelias address schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.address_parts key for which it should be mapped to.

  eg. tags['addr:street'] -> doc.address_parts['street']

  @ref: http://wiki.openstreetmap.org/wiki/Karlsruhe_Schema
**/

var KARLSRUHE_SCHEMA = {
  'addr:housename':     'name',
  'addr:housenumber':   'number',
  'addr:street':        'street',
  'addr:postcode':      'zip'

  // @ref: https://github.com/pelias/model/pull/13
  // 'addr:state':         'state',
  // 'addr:city':          'city',
  // 'addr:country':       'country'
};

module.exports = KARLSRUHE_SCHEMA;