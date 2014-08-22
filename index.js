
var filename = '/media/hdd/osm/mapzen-metro/london.osm.pbf';
// filename = '/media/hdd/osm/mapzen-metro/new-york.osm.pbf';
//filename = '/media/hdd/osm/mapzen-metro/auckland.osm.pbf'; // 1037565 nodes
// filename = '/media/hdd/osm/mapzen-metro/wellington.osm.pbf'; // 1711906 nodes
// filename = '/media/hdd/osm/mapzen-metro/damascus.osm.pbf';
// filename = '/media/hdd/osm/geofabrik/greater-london-latest.osm.pbf';
// filename = '/media/hdd/osm/geofabrik/new-zealand-latest.osm.pbf'; // 19232000 total, 19226584 nodes, 5416 ways
// filename = '/media/hdd/osm/mapzen-metro/munich.osm.pbf';

var fs = require('fs');
var levelup = require('levelup');
var multilevel = require('level-multiply');
// var config = require('pelias-config');

// generic streams
var stringify =                require('./stream/stringify');
var devnull =                  require('./stream/devnull');
var required =                 require('./stream/required');
// var sporadic =                 require('./stream/sporadic');

// sinks
var backend = {
  es: {
    osmnode:                  require('./stream/es_backend')('pelias', 'osmnode'),
    // osmnodeany:               require('./stream/es_backend')('pelias', undefined),
    osmway:                   require('./stream/es_backend')('pelias', 'osmway'),
    geonames:                 require('./stream/es_backend')('pelias', 'geoname')
  },
  level: {
    osmnodecentroids:         multilevel( levelup( '/tmp/centroids', { valueEncoding: 'json' } ), 'm' )
  }
};

// taps
var osm2 =                     require('./stream/osm2');

// forkers
var osm_types =                require('./stream/osm_types');

// pelias
var pelias = {
  suggester:                   require('./stream/pelias/suggester')
};

// osm
var osm = {
  way: {
    denormalizer:              require('./stream/osm/way/denormalizer'),
  },
  any: {
    hierachyLookup:            require('./stream/osm/any/hierachyLookup')
  }
};

var feature_filter =           require('./stream/feature_filter');
var node_filter =              require('./stream/node_filter');
var node_basic_filter =        require('./stream/node_basic_filter');
var node_mapper =              require('./stream/node_mapper');
var node_type =                require('./stream/node_type');
var node_centroid_cache =      require('./stream/node_centroid_cache');

//var quattroshapes =            require('./stream/quattroshapes');
var way_mapper =               require('./stream/way_mapper');
var exit_on_id =               require('./stream/exit_on_id');
var way_filter =               require('./stream/way_filter');
var stats =                    require('./stream/stats');

// enable/disable debugging of bottlenecks in the pipeline.
stats.enabled = true;

// entry point for node pipeline
node_fork = stats( 'osm_types -> node_centroid_cache' );
node_fork
  .pipe( node_centroid_cache( backend.level.osmnodecentroids ) )
  .pipe( stats( 'node_centroid_cache -> node_basic_filter' ) )
  .pipe( node_filter() )
  .pipe( stats( 'node_basic_filter -> node_mapper' ) )
  .pipe( node_mapper() )
  .pipe( stats( 'node_mapper -> node_type' ) )
  .pipe( node_type() ) // send the non-poi nodes to another index
  .pipe( stats( 'node_type -> geonames' ) )
  .pipe( osm.any.hierachyLookup( backend.es.geonames ) )
  .pipe( stats( 'geonames -> suggester' ) )
  .pipe( pelias.suggester() )
  .pipe( stats( 'suggester -> es_backend' ) )
  .pipe( backend.es.osmnode.createPullStream() );

// entry point for way pipeline
way_fork = stats( 'osm_types -> way_mapper' );
way_fork
  // .pipe( exit_on_id( 79338918, 'hackney city farm' ) )
  // .pipe( exit_on_id( 23904006, 'auckland town hall' ) )
  .pipe( way_mapper() ) // @todo: this does too much; simplify
  .pipe( stats( 'way_mapper -> way_filter' ) )
  .pipe( way_filter() )
  .pipe( stats( 'way_filter -> way_denormalizer' ) )
  .pipe( osm.way.denormalizer( backend.level.osmnodecentroids ) )
  .pipe( stats( 'way_denormalizer -> way_geonames' ) )
  .pipe( osm.any.hierachyLookup( backend.es.geonames ) )
  .pipe( stats( 'way_geonames -> way_suggester' ) )
  .pipe( pelias.suggester() ) // @todo: change this to the tested suggester module
  .pipe( stats( 'way_suggester -> way_es_backend' ) )
  .pipe( backend.es.osmway.createPullStream() );

// pipe objects to stringify for debugging
debug_fork = stringify();
debug_fork.pipe( process.stdout );

// check file exists
try {
  fs.statSync( filename );
} catch( e ){
  console.error( 'failed to load:', filename );
  process.exit(1);
}

var osm = require('osm-pbf-parser')();

fs.createReadStream( filename )
  .pipe(osm)

// var reader = osm2( filename );
// reader.on( 'unpipe', function(){
//   console.log( 'reader unpipe' );
//   process.exit(0);
// });

// reader
  .pipe( stats( 'reader -> osm_types' ) )
  .pipe( osm_types({
    node:     node_fork, //devnull()
    way:      way_fork,
    relation: devnull(),
  }))
;
