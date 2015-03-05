
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

module.exports = function( doc ){

  if( doc.hasMeta('tags') ){

    var tags = doc.getMeta('tags');

    // default name
    if( tags.hasOwnProperty( 'name' ) ){
      doc.setName( 'default', tags.name );
    }

    // localized names
    for( var tag in tags ){
      if( tag.match('name:') ){
        doc.setName( tag.replace('name:',''), tags[tag] );
      }
    }

    // map common osm name formats
    osm_name_mapper( doc );

    // clean names of leading/trailing junk chars
    for( var prop in doc.name ){
      doc.name[prop] = trimmer( doc.name[prop], '#$%^*()<>-=_{};:",./?\' ' ); // junk chars
    }
  }

};