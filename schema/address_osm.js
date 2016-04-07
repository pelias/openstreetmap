
/**
  Attempt to map OSM address tags to the Pelias address schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.address key for which it should be mapped to.

  eg. tags['postal_code'] -> doc.address_parts['zip']

  @ref: http://wiki.openstreetmap.org/wiki/Key:postal_code
**/

var OSM_SCHEMA = {
  'postal_code': 'zip'
};

module.exports = OSM_SCHEMA;