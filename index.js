
var filename = '/media/hdd/osm/mapzen-metro/london.osm.pbf';
filename = '/media/hdd/osm/mapzen-metro/new-york.osm.pbf';
// filename = '/media/hdd/osm/mapzen-metro/auckland.osm.pbf';
// filename = '/media/hdd/osm/mapzen-metro/damascus.osm.pbf';
// filename = '/media/hdd/osm/geofabrik/greater-london-latest.osm.pbf';

var fs = require('fs');

// generic streams
var stringify =                require('./stream/stringify');
var devnull =                  require('./stream/devnull');
var required =                 require('./stream/required');
// var sporadic =                 require('./stream/sporadic');

// sinks
var backend = {
  es: {
    osmnode:                  require('./stream/es_backend')('pelias', 'osmnode'),
    osmnodeany:               require('./stream/es_backend')('pelias', undefined),
    osmway:                   require('./stream/es_backend')('pelias', 'osmway'),
    geonames:                 require('./stream/es_backend')('pelias', 'geoname')
  }
}

// taps
var osm2 =                     require('./stream/osm2');

// forkers
var osm_types =                require('./stream/osm_types');

// pelias
var pelias = {
  suggester:                   require('./stream/pelias/suggester')
}

// osm
var osm = {
  way: {
    denormalizer:              require('./stream/osm/way/denormalizer'),
  },
  any: {
    hierachyLookup:            require('./stream/osm/any/hierachyLookup')
  }
}

var feature_filter =           require('./stream/feature_filter');
var node_filter =              require('./stream/node_filter');
var node_basic_filter =        require('./stream/node_basic_filter');
var node_mapper =              require('./stream/node_mapper');
var node_type =                require('./stream/node_type');

//var quattroshapes =            require('./stream/quattroshapes');
var way_mapper =               require('./stream/way_mapper');
var stats =                    require('./stream/stats');

// enable/disable debugging of bottlenecks in the pipeline.
stats.enabled = false;

// entry point for node pipeline
node_fork = stats( 'osm_types -> node_basic_filter' );
node_fork
  .pipe( node_basic_filter() )
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
  .pipe( way_mapper() ) // @todo: this does too much; simplify
  .pipe( stats( 'way_mapper -> feature_filter' ) )
  .pipe( osm.way.denormalizer( backend.es.osmnodeany ) )
  .pipe( stats( 'wayDenormalizer -> geonames' ) )
  .pipe( osm.any.hierachyLookup( backend.es.geonames ) )
  .pipe( stats( 'geonames -> suggester' ) )
  .pipe( pelias.suggester() )
  .pipe( stats( 'suggester -> es_backend' ) )
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

var reader = osm2( filename );
// reader.on( 'unpipe', function(){
//   console.log( 'reader unpipe' );
//   process.exit(0);
// });

reader
  .pipe( stats( 'reader -> osm_types' ) )
  .pipe( osm_types({
    node:     node_fork,
    way:      way_fork,
    relation: devnull(),
  }))
;
