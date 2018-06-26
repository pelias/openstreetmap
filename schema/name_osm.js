
/**
  Attempt to map OSM name tags to the Pelias naming schema.

  On the left is the OSM tag name, on the right is corresponding
  doc.name key for which it should be mapped to.

  eg. tags['alt_name'] -> doc.name['alternative']

  The value 'default' is special, it defines the name used by default
  for elasticsearch queries, it has the unique ability to specify multiple
  keys with a value of 'default'.

  When multiple keys have the value 'default' then they are considered
  as aliases of the default field.

  The '_primary' property defined below defines which of those aliases
  is considered the 'primary default name' for label generation.

  No values other than 'default' should be specified more than once.

  @ref: http://wiki.openstreetmap.org/wiki/Key:name
  @ref: http://wiki.openstreetmap.org/wiki/Names
**/

var OSM_NAMING_SCHEMA = {
  'name':             'default',
  'loc_name':         'default',
  'alt_name':         'default',
  'int_name':         'international',
  'nat_name':         'national',
  'official_name':    'official',
  'old_name':         'old',
  'reg_name':         'regional',
  'short_name':       'default',
  'sorting_name':     'sorting'
};

// this property is considered the 'primary name'
// for label generation, the others are considered
// secondary or 'aliases'.
Object.defineProperty(OSM_NAMING_SCHEMA, '_primary', {
  value: 'name',
  enumerable: false,
  configurable: false,
  writable: false
});

module.exports = OSM_NAMING_SCHEMA;