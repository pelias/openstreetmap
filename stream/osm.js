
var parseOSM = require('osm-pbf-parser');
var osm = parseOSM();

osm.on( 'error', function(){
  console.log( 'OSM ERROR' );
});

module.exports = osm;
