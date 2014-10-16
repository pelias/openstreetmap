
var address_mapper = require('../address_mapper');

var OSM_NAME_SCHEMA = {
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

var osm_name_mapper = address_mapper(OSM_NAME_SCHEMA);

module.exports = function( item, record ){

  if( item.tags ){

    // default name
    if( item.tags.name ){
      record.name.default = item.tags.name;
      delete item.tags['name'];
    }

    // localized names
    for( var tag in item.tags ){
      if( tag.match('name:') ){
        record.name[ tag.replace('name:','') ] = item.tags[tag];
        delete item.tags[tag];
      }
    }

    // map common osm name formats
    osm_name_mapper( item, record );
  }

};