
/**
  Attempt to map OSM address tags to the Pelias address schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.address key for which it should be mapped to.

  eg. tags['naptan:Street'] -> doc.address_parts['street']

  @ref: http://wiki.openstreetmap.org/wiki/NaPTAN
**/

var NAPTAN_SCHEMA = {
  'naptan:Street': 'street'
};

module.exports = NAPTAN_SCHEMA;