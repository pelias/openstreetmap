
var filename = '/media/hdd/osm/mapzen-metro/london.osm.pbf';
//filename = '/media/hdd/osm/mapzen-metro/new-york.osm.pbf';
//filename = '/media/hdd/osm/mapzen-metro/auckland.osm.pbf';
//filename = '/media/hdd/osm/mapzen-metro/damascus.osm.pbf';

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
  node_basic_filter:        require( './stream/node_basic_filter' ),
  node_mapper:              require( './stream/node_mapper' ),
  node_type:                require( './stream/node_type' ),
  suggest:                  require( './stream/suggest' ),
  geonames:                 require( './stream/geonames' ),
  // quattroshapes:            require( './stream/quattroshapes' ),
  way_mapper:               require( './stream/way_mapper' ),
  way_normalizer:           require( './stream/way_normalizer' ),
  stats:                    require( './stream/stats' )
}

// enable/disable debugging of bottlenecks in the pipeline.
streams.stats.enabled = false;

// entry point for node pipeline
streams.node_entry = streams.stats( 'osm_types -> node_basic_filter' );

streams.node_entry
  // .pipe( streams.node_filter )
  // .pipe( streams.stats( 'node_filter -> node_mapper' ) )
  .pipe( streams.node_basic_filter )
  .pipe( streams.stats( 'node_basic_filter -> node_mapper' ) )
  .pipe( streams.node_mapper )
  // .pipe( streams.stats( 'node_mapper -> node_type' ) )
  // .pipe( streams.node_type )
  .pipe( streams.stats( 'node_type -> geonames' ) )
  .pipe( streams.geonames )
  .pipe( streams.stats( 'geonames -> suggest' ) )
  .pipe( streams.suggest )
  .pipe( streams.stats( 'suggest -> es_client' ) )
  .pipe( es_client( 'pelias', 'osmnode' ) );

streams.way_mapper
  .pipe( streams.way_normalizer )
  .pipe( es_client( 'import', 'way' ) );

// pipe objects to streams.stringify for debugging
streams.stringify.pipe( process.stdout );

// check file exists
try {
  fs.statSync( filename );
} catch( e ){
  console.error( 'failed to load:', filename );
  process.exit(1);
}

var reader = streams.osm2( filename );
// reader.on( 'unpipe', function(){
//   console.log( 'reader unpipe' );
//   process.exit(0);
// });

reader
  .pipe( streams.stats( 'reader -> osm_types' ) )
  .pipe( osm_types({
    node:     streams.node_entry,
    way:      streams.devnull, //streams.way_mapper,
    relation: streams.devnull,
  }))
;
