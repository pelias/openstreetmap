var features = [
  "amenity",
  "building",
  "shop",
  "office",
  "public_transport",
  "cuisine",
  "railway",
  "sport",
  "natural",
  "tourism",
  "leisure",
  "historic",
  "man_made",
  "landuse",
  "waterway",
  "aerialway",
  "aeroway",
  "craft",
  "military"
];

function getFeature( item ){
  if( 'object' == typeof item && 'object' == typeof item.tags ){
    for( var x=0; x<features.length; x++ ){
      if( item.tags.hasOwnProperty( features[x] ) ){
        return features[x];
      }
    }
  }
  return false;
}

module.exports = {
  features: features,
  getFeature: getFeature
}