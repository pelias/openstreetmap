
/**
 default list of tags to extract from the pbf file when running
 imports. @see: https://github.com/pelias/pbf2json for more info.
**/

// default tags imported
const tags = [
  'addr:housenumber+addr:street',
  'addr:housenumber+addr:place'  // @ref https://github.com/pelias/pelias/issues/787#issuecomment-477137803
];

// tags corresponding to venues
const venue_tags = [
  'amenity+name',
  'building+name',
  'shop+name',
  'office+name',
  'cuisine+name',
  'railway~station+name',
  'railway~halt+name',
  'railway~subway_entrance+name',
  'railway~train_station_entrance+name',
  'highway~pedestrian+area~yes+name',
  'place~square+name',
  'sport+name',
  'natural+name',
  'tourism+name',
  'leisure+name',
  'historic+name',
  'man_made+name',
  'landuse+name',
  'waterway+name',
  'aerialway+name',
  'craft+name',
  'military+name',
  'aeroway~terminal+name',
  'aeroway~aerodrome+name',
  'aeroway~helipad+name',
  'aeroway~airstrip+name',
  'aeroway~heliport+name',
  'aeroway~areodrome+name',
  'aeroway~spaceport+name',
  'aeroway~landing_strip+name',
  'aeroway~airfield+name',
  'aeroway~airport+name',
  'brand+name',
  'healthcare+name'
];

module.exports = {tags,venue_tags};
