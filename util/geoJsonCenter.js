
var extent = require('geojson-extent'),
    geolib = require('geolib');

module.exports = function( geometry ){

  var bounds = extent( geometry );

  var center = geolib.getCenter([
    [ bounds[0], bounds[1] ],
    [ bounds[2], bounds[3] ]
  ]);

  if( center.latitude && center.longitude ){
    return { lat: center.latitude, lon: center.longitude };
  }

  return;
}
