
var gktk = require('gjtk');

var mapping = {
  'MultiPolygon'    : gktk.isMultiPolygonCoordinates,
  'Polygon'         : gktk.isPolygonCoordinates,
  'MultiLineString' : gktk.isMultiLineStringCoordinates,
  // 'LinearRing'      : gktk.isLinearRingCoordinates,
  'LineString'      : gktk.isLineStringCoordinates,
  'MultiPoint'      : gktk.isMultiPointCoordinates,
  'Point'           : gktk.isPointCoordinates
};

module.exports = function( points ){
  for( var type in mapping ){
    if( mapping[ type ]( points ) ){
      return type;
    }
  }
  return 'LineString';
};