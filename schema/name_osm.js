
/**
  Attempt to map OSM name tags to the Pelias naming schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.name key for which it should be mapped to.

  eg. tags['alt_name'] -> doc.name['alternative']

  @ref: http://wiki.openstreetmap.org/wiki/Key:name
**/

var OSM_NAMING_SCHEMA = {
  'name':             'default',
  'loc_name':         'local',
  'alt_name':         'alternative',
  'int_name':         'international',
  'nat_name':         'national',
  'official_name':    'official',
  'old_name':         'old',
  'reg_name':         'regional',
  'short_name':       'short',
  'sorting_name':     'sorting'
};

module.exports = OSM_NAMING_SCHEMA;