
var fs = require('fs');
var osm_types = require( './stream/osm_types' );
var es_client = require( './stream/es_client' );

var streams = {
  pbf:              fs.createReadStream( '/media/hdd/osm/mapzen-metro/london.osm.pbf' ),
  osm:              require( './stream/osm' ),
  stringify:        require( './stream/stringify' ),
  devnull:          require( './stream/devnull' ),
  // sporadic:        require( './stream/sporadic' ),
  node_mapper:      require( './stream/node_mapper' ),
  way_mapper:       require( './stream/way_mapper' ),
  way_normalizer:   require( './stream/way_normalizer' )
}

streams.node_mapper.pipe( es_client( 'import', 'node' ) );
streams.way_mapper.pipe( streams.way_normalizer ).pipe( es_client( 'import', 'way' ) );
streams.stringify.pipe( process.stdout );

streams.pbf
  .pipe( streams.osm )
  .pipe( osm_types({
    node:     streams.node_mapper,
    way:      streams.way_mapper,
    relation: streams.devnull,
  }))
;