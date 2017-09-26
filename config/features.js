
/**
 default list of tags to extract from the pbf file when running
 imports. @see: https://github.com/pelias/pbf2json for more info.
**/

var tags = [
  'addr:housenumber+addr:street',
  'addr:housename',
  'place+name', 'place+name:fi',
  'amenity+name', 'amenity+name:fi',
  'building+name', 'building+name:fi',
  'shop+name', 'shop+name:fi',
  'office+name', 'office+name:fi',
  'public_transport+name', 'public_transport+name:fi',
  'cuisine+name', 'cuisine+name:fi',
  'railway+name', 'railway+name:fi',
  'sport+name', 'sport+name:fi',
  'natural+name', 'natural+name:fi',
  'tourism+name', 'tourism+name:fi',
  'leisure+name', 'leisure+name:fi',
  'historic+name', 'historic+name:fi',
  'man_made+name', 'man_made+name:fi',
  'landuse+name', 'landuse+name:fi',
  'waterway+name', 'waterway+name:fi',
  'aerialway+name', 'aerialway+name:fi',
  'craft+name', 'craft+name:fi',
  'military+name', 'military+name:fi',
  'aeroway~terminal+name', 'aeroway~terminal+name:fi',
  'aeroway~aerodrome+name', 'aeroway~aerodrome+name:fi',
  'aeroway~helipad+name', 'aeroway~helipad+name:fi',
  'aeroway~airstrip+name', 'aeroway~airstrip+name:fi',
  'aeroway~heliport+name', 'aeroway~heliport+name:fi',
  'aeroway~areodrome+name', 'aeroway~areodrome+name:fi',
  'aeroway~spaceport+name', 'aeroway~spaceport+name:fi',
  'aeroway~landing_strip+name', 'aeroway~landing_strip+name:fi',
  'aeroway~airfield+name', 'aeroway~airfield+name:fi',
  'aeroway~airport+name', 'aeroway~airport+name:fi'
];

module.exports = tags;
