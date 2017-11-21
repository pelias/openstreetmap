
/**
 default list of tags to extract from the pbf file when running
 imports. @see: https://github.com/pelias/pbf2json for more info.
**/

var tags = [
  'addr:housenumber+addr:street',
  'amenity+name',
  'building+name',
  'shop+name',
  'office+name',
  'public_transport+name',
  'cuisine+name',
  'railway~station+name',
  'railway~tram_stop+name',
  'railway~halt+name',
  'railway~subway_entrance+name',
  'railway~train_station_entrance+name',
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
  'aeroway~airport+name'
];

module.exports = tags;
