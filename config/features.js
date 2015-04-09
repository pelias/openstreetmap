
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
  'railway+name',
  'sport+name',
  'natural+name',
  'tourism+name',
  'leisure+name',
  'historic+name',
  'man_made+name',
  'landuse+name',
  'waterway+name',
  'aerialway+name',
  'aeroway+name',
  'craft+name',
  'military+name'
];

module.exports = tags;