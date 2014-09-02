
var fs = require('fs'),
    levelup = require('levelup'),
    multilevel = require('level-multiply'),
    parser = require('osm-pbf-parser')(),
    through = require('through2'),
    suggester = require('pelias-suggester-pipeline'),
    propStream = require('prop-stream'),
    settings = require('pelias-config').generate();

var bun = require('bun');

function generateSuggester(){
  return bun([
    suggester.streams.suggestable(),
    suggester.streams.suggester( suggester.generators )
  ]);
}

// var filename = '/media/hdd/osm/mapzen-metro/london.osm.pbf';
// filename = '/media/hdd/osm/mapzen-metro/new-york.osm.pbf';
//filename = '/media/hdd/osm/mapzen-metro/auckland.osm.pbf'; // 1037565 nodes
// filename = '/media/hdd/osm/mapzen-metro/wellington.osm.pbf'; // 1711906 nodes
// filename = '/media/hdd/osm/mapzen-metro/damascus.osm.pbf';
// filename = '/media/hdd/osm/geofabrik/greater-london-latest.osm.pbf';
// filename = '/media/hdd/osm/geofabrik/new-zealand-latest.osm.pbf'; // 19232000 total, 19226584 nodes, 5416 ways
// filename = '/media/hdd/osm/mapzen-metro/munich.osm.pbf';

// use datapath setting from your config file
var basepath = settings.imports.openstreetmap.datapath;
var filename = settings.imports.openstreetmap.import[0].filename;
var leveldbpath = settings.imports.openstreetmap.leveldbpath;

// testing
// basepath = '/media/hdd/osm/mapzen-metro';
// filename = 'wellington.osm.pbf';

var pbfFilePath = basepath + '/' + filename;
// check pbf file exists
try {
  fs.statSync( pbfFilePath );
} catch( e ){
  console.error( 'failed to load pbf file:', pbfFilePath );
  process.exit(1);
}

// check leveldb dir exists
try {
  fs.statSync( leveldbpath );
} catch( e ){
  console.error( 'failed to open:', leveldbpath );
  process.exit(1);
}

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
    geonames:                 require('./stream/es_backend')('pelias', 'geoname'),
    admin0:                   require('./stream/es_backend')('pelias', 'admin0'),
    admin1:                   require('./stream/es_backend')('pelias', 'admin1'),
    admin2:                   require('./stream/es_backend')('pelias', 'admin2'),
    local_admin:              require('./stream/es_backend')('pelias', 'local_admin'),
    locality:                 require('./stream/es_backend')('pelias', 'locality'),
    neighborhood:             require('./stream/es_backend')('pelias', 'neighborhood')
  },
  level: {
    osmnodecentroids:         multilevel( levelup( leveldbpath ), 'm' )
  }
};

// forkers
var osm_types =                require('./stream/osm_types');

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
var address_extractor =        require('./stream/address_extractor');

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
  .pipe( stats( 'node_centroid_cache -> node_filter' ) )
  .pipe( node_filter() )
  .pipe( stats( 'node_filter -> node_mapper' ) )
  .pipe( node_mapper() )
  .pipe( stats( 'node_mapper -> node_type' ) )
  .pipe( node_type() ) // send the non-poi nodes to another index
  .pipe( stats( 'node_type -> node_hierachyLookup' ) )
  .pipe( osm.any.hierachyLookup([
    { type: 'neighborhood'  , adapter: backend.es.neighborhood },
    { type: 'locality'      , adapter: backend.es.locality },
    { type: 'local_admin'   , adapter: backend.es.local_admin },
    { type: 'admin2'        , adapter: backend.es.admin2 },
    { type: 'admin1'        , adapter: backend.es.admin1 },
    { type: 'admin0'        , adapter: backend.es.admin0 }
  ], backend.es.geonames ))

  .pipe( stats( 'node_hierachyLookup -> node_meta.type' ) )

  // add correct meta info for suggester payload
  // @todo: make this better
  .pipe( through.obj( function( item, enc, next ){
    if( !item.hasOwnProperty('_meta') ){ item._meta = {}; }
    item._meta.type = 'osmnode';
    this.push( item );
    next();
  }))

  .pipe( stats( 'node_meta.type -> node_address_extractor' ) )

  // extract addresses & create a new record for each
  // @todo: make this better
  .pipe( address_extractor() )

  .pipe( stats( 'node_address_extractor -> node_suggester' ) )
  .pipe( generateSuggester() )

  .pipe( stats( 'node_suggester -> node_blacklist' ) )

  // remove tags
  // @todo: make this better
  .pipe( propStream.blacklist(['tags']) )

  .pipe( stats( 'node_blacklist -> es_osmnode_backend' ) )
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
  .pipe( stats( 'way_denormalizer -> way_hierachyLookup' ) )
  .pipe( osm.any.hierachyLookup([
    { type: 'neighborhood'  , adapter: backend.es.neighborhood },
    { type: 'locality'      , adapter: backend.es.locality },
    { type: 'local_admin'   , adapter: backend.es.local_admin },
    { type: 'admin2'        , adapter: backend.es.admin2 },
    { type: 'admin1'        , adapter: backend.es.admin1 },
    { type: 'admin0'        , adapter: backend.es.admin0 }
  ], backend.es.geonames ))

  .pipe( stats( 'way_hierachyLookup -> way_meta.type' ) )

  // add correct meta info for suggester payload
  // @todo: make this better
  .pipe( through.obj( function( item, enc, next ){
    if( !item.hasOwnProperty('_meta') ){ item._meta = {}; }
    item._meta.type = 'osmway';
    this.push( item );
    next();
  }))

  // @todo: extract addresses from ways

  .pipe( stats( 'way_meta.type -> way_suggester' ) )
  .pipe( generateSuggester() )

  // remove tags
  // @todo: make this better
  .pipe( stats( 'way_suggester -> way_blacklist' ) )
  .pipe( propStream.blacklist(['tags','geo']) )

  .pipe( stats( 'way_blacklist -> es_osmway_backend' ) )
  .pipe( backend.es.osmway.createPullStream() );

// pipe objects to stringify for debugging
debug_fork = stringify();
debug_fork.pipe( process.stdout );

fs.createReadStream( pbfFilePath )
  .pipe( parser )
  .pipe( stats( 'reader -> osm_types' ) )
  .pipe( osm_types({
    node:     node_fork, //devnull()
    way:      way_fork,
    relation: devnull(),
  }))
;
