
/**
 this module is used to find the centroid of a geojson geometry.
**/

var geolib = require('geolib');

/**
 * Computes the centroid of a geometry represented by a list of points.
 *
 * @param {array} geometry array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
 * @returns null | { lat: {number}, lon: {number} }
 */
function computeCenter( geometry ){

  var center = geolib.getCenter( geometry );

  if( center.latitude && center.longitude ){
    return { lat: center.latitude, lon: center.longitude };
  }

  return null;
}

/**
 * Computes the bounding box enclosing a list of points.
 *
 * @param {array} geometry array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
 * @returns null |
 *    {
 *      upperLeft: {
 *        lat: {number},
 *        lon: {number}
 *      },
 *      lowerRight: {
 *        lat: {number},
 *        lon: {number}
 *      }
 *    }
 */
function computeBBox( geometry ) {

  var bbox = geolib.getBounds( geometry );

  if (bbox.hasOwnProperty('maxLat') &&
      bbox.hasOwnProperty('maxLng') &&
      bbox.hasOwnProperty('minLat') &&
      bbox.hasOwnProperty('minLng')) {

    var bboxObj = {
      upperLeft: {
        lat: bbox.maxLat,
        lon: bbox.minLng
      },
      lowerRight: {
        lat: bbox.minLat,
        lon: bbox.maxLng
      }
    };

    return bboxObj;
  }

  return null;
}



module.exports.computeCenter = computeCenter;
module.exports.computeBBox = computeBBox;
