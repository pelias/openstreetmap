
/**
 this module is used to find the centroid of a geojson geometry.
**/

var geolib = require('geolib');

module.exports = function( geometry ){

  var center = geolib.getCenter( geometry );

  if( center.latitude && center.longitude ){
    return { lat: center.latitude, lon: center.longitude };
  }

  return null;
};
