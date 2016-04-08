
/**
  Attempt to map OSM TIGER tags to the Pelias address schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.address key for which it should be mapped to.

  eg. tags['tiger:zip_left'] -> doc.address_parts['zip']

  @ref: http://wiki.openstreetmap.org/wiki/TIGER_to_OSM_Attribute_Map
**/

var TIGER_SCHEMA = {
  'tiger:zip_left': 'zip',
  'tiger:zip_right': 'zip'
};

module.exports = TIGER_SCHEMA;