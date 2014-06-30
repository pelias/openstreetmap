
var fs = require('fs');
var osm_types = require( './stream/osm_types' );
var es_client = require( './stream/es_client' );

var streams = {
  // pbf:                      fs.createReadStream( '/media/hdd/osm/mapzen-metro/london.osm.pbf' ),
  // osm:                      require( './stream/osm' ),
  osm2:                     require( './stream/osm2' ),
  stringify:                require( './stream/stringify' ),
  devnull:                  require( './stream/devnull' ),
  // sporadic:                require( './stream/sporadic' ),
  node_filter:              require( './stream/node_filter' ),
  node_mapper:              require( './stream/node_mapper' ),
  suggest:                  require( './stream/suggest' ),
  geonames:                 require( './stream/geonames' ),
  // quattroshapes:            require( './stream/quattroshapes' ),
  way_mapper:               require( './stream/way_mapper' ),
  way_normalizer:           require( './stream/way_normalizer' )
}

streams.node_filter
  .pipe( streams.node_mapper )
  .pipe( streams.geonames )
  .pipe( streams.suggest )
  .pipe( es_client( 'pelias', 'osmnode' ) );

streams.way_mapper
  .pipe( streams.way_normalizer )
  .pipe( es_client( 'import', 'way' ) );

streams.stringify
  .pipe( process.stdout );

streams.osm2( '/media/hdd/osm/mapzen-metro/london.osm.pbf' )
  .pipe( osm_types({
    node:     streams.node_filter,
    way:      streams.devnull, //streams.way_mapper,
    relation: streams.devnull,
  }))
;