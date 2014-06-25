
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

module.exports = function( node, record ){

  if( node.tags ){

    // default name
    if( node.tags.name ){
      record.name.default = node.tags.name;
      delete node.tags['name'];
    }

    // localized names
    for( var tag in node.tags ){
      if( tag.match('name:') ){
        record.name[ tag.replace('name:','') ] = node.tags[tag];
        delete node.tags[tag];
      }
    }

    // map common osm name formats
    osm_name_mapper( node, record )
  }

};