
/**
  Attempt to map OSM address tags to the Pelias address schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.address key for which it should be mapped to.

  eg. tags['addr:street'] -> doc.address['street']

  @ref: http://wiki.openstreetmap.org/wiki/Karlsruhe_Schema
**/

var KARLSRUHE_SCHEMA = {
  'addr:housename':     'name',
  'addr:housenumber':   'number',
  'addr:street':        'street',
  'addr:state':         'state',
  'addr:postcode':      'zip',
  'addr:city':          'city',
  'addr:country':       'country'
};

module.exports = KARLSRUHE_SCHEMA;