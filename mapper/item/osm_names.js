
var address_mapper = require('../address_mapper'),
    trimmer = require('trimmer');

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

var osm_name_mapper = address_mapper(OSM_NAME_SCHEMA,'name');

module.exports = function( item, record ){

  if( record.hasMeta('tags') ){

    var tags = record.getMeta('tags');

    // default name
    if( tags.hasOwnProperty( 'name' ) ){
      record.setName( 'default', tags.name );
    }

    // localized names
    for( var tag in tags ){
      if( tag.match('name:') ){
        record.setName( tag.replace('name:',''), tags[tag] );
      }
    }

    // map common osm name formats
    osm_name_mapper( item, record );

    // clean names of leading/trailing junk chars
    for( var prop in record.name ){
      record.name[prop] = trimmer( record.name[prop], '#$%^*()<>-=_{};:",./?\' ' ); // junk chars
    }
  }

};