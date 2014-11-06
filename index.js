
var fs = require('fs'),
    levelup = require('levelup'),
    multilevel = require('level-multiply'),
    parser = require('osm-pbf-parser')(),
    through = require('through2'),
    suggester = require('pelias-suggester-pipeline'),
    propStream = require('prop-stream'),
    settings = require('pelias-config').generate(),
    dbclient = require('pelias-dbclient')();

// @todo: extract this or refactor suggester to make it a stream factory
var bun = require('bun');
function generateSuggester(){
  return bun([
    suggester.streams.suggestable(),
    suggester.streams.suggester( suggester.generators )
  ]);
}

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
    hierarchyLookup:            require('./stream/osm/any/hierarchyLookup')
  }
};

var feature_filter =           require('./stream/feature_filter');
var osm_filter =               require('./stream/osm_filter');
var node_basic_filter =        require('./stream/node_basic_filter');
var osm_mapper =               require('./stream/osm_mapper');
var node_type =                require('./stream/node_type');
var node_centroid_cache =      require('./stream/node_centroid_cache');
var address_extractor =        require('./stream/address_extractor');

//var quattroshapes =            require('./stream/quattroshapes');
var exit_on_id =               require('./stream/exit_on_id');
var stats =                    require('./stream/stats');

// enable/disable debugging of bottlenecks in the pipeline.
stats.enabled = true;

// entry point for node pipeline
node_fork = stats( 'osm_types -> node_centroid_cache' );
node_fork

  // store centroids in cache
  .pipe( node_centroid_cache( backend.level.osmnodecentroids ) )
  .pipe( stats( 'node_centroid_cache -> node_filter' ) )

  // map and filter records
  .pipe( osm_filter() )
  .pipe( stats( 'node_filter -> node_mapper' ) )
  .pipe( osm_mapper() )
  .pipe( stats( 'node_mapper -> node_hierarchyLookup' ) )

  // hierarchy lookup
  .pipe( osm.any.hierarchyLookup([
    { type: 'neighborhood'  , adapter: backend.es.neighborhood },
    { type: 'locality'      , adapter: backend.es.locality },
    { type: 'local_admin'   , adapter: backend.es.local_admin },
    { type: 'admin2'        , adapter: backend.es.admin2 },
    { type: 'admin1'        , adapter: backend.es.admin1 },
    { type: 'admin0'        , adapter: backend.es.admin0 }
  ], backend.es.geonames ))
  .pipe( stats( 'node_hierarchyLookup -> node_meta.type' ) )

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

  .pipe( stats( 'node_suggester -> node_whitelist' ) )

  // remove tags not in schema (or throws StrictDynamicMappingException)
  // note: 'tags' are being stripped to reduce db size
  .pipe( propStream.whitelist(['id','name','address','type','alpha3','admin0','admin1','admin1_abbr','admin2','local_admin','locality','neighborhood','center_point','suggest']) )

  .pipe( stats( 'node_blacklist -> es_osmnode_backend' ) )
  // .pipe( backend.es.osmnode.createPullStream() );
  .pipe( through.obj( function( item, enc, next ){
    var id = item.id;
    delete item.id;
    this.push({
      _index: 'pelias',
      _type: 'osmnode',
      _id: id,
      data: item
    });
    next();
  }))
  .pipe( dbclient );

// entry point for way pipeline
way_fork = stats( 'osm_types -> way_filter' );
way_fork

  // map and filter records
  .pipe( osm_filter() )
  .pipe( stats( 'way_filter -> way_mapper' ) )
  .pipe( osm_mapper() )
  .pipe( stats( 'way_mapper -> way_denormalizer' ) )

  // lookup centroids from cache
  .pipe( osm.way.denormalizer( backend.level.osmnodecentroids ) )
  .pipe( stats( 'way_denormalizer -> way_hierarchyLookup' ) )

  // hierarchy lookup
  .pipe( osm.any.hierarchyLookup([
    { type: 'neighborhood'  , adapter: backend.es.neighborhood },
    { type: 'locality'      , adapter: backend.es.locality },
    { type: 'local_admin'   , adapter: backend.es.local_admin },
    { type: 'admin2'        , adapter: backend.es.admin2 },
    { type: 'admin1'        , adapter: backend.es.admin1 },
    { type: 'admin0'        , adapter: backend.es.admin0 }
  ], backend.es.geonames ))
  .pipe( stats( 'way_hierarchyLookup -> way_meta.type' ) )

  // add correct meta info for suggester payload
  // @todo: make this better
  .pipe( through.obj( function( item, enc, next ){
    if( !item.hasOwnProperty('_meta') ){ item._meta = {}; }
    item._meta.type = 'osmway';
    this.push( item );
    next();
  }))

  .pipe( stats( 'way_meta.type -> way_address_extractor' ) )

  // extract addresses & create a new record for each
  // @todo: make this better
  .pipe( address_extractor() )

  .pipe( stats( 'way_address_extractor -> way_suggester' ) )
  .pipe( generateSuggester() )

  .pipe( stats( 'way_suggester -> way_blacklist' ) )

  // remove tags not in schema (or throws StrictDynamicMappingException)
  // note: 'tags' are being stripped to reduce db size
  .pipe( propStream.whitelist(['id','name','address','type','alpha3','admin0','admin1','admin1_abbr','admin2','local_admin','locality','neighborhood','center_point','suggest']) )

  .pipe( stats( 'way_blacklist -> es_osmway_backend' ) )
  // .pipe( backend.es.osmway.createPullStream() );
  .pipe( through.obj( function( item, enc, next ){
    var id = item.id;
    delete item.id;
    this.push({
      _index: 'pelias',
      _type: 'osmway',
      _id: id,
      data: item
    });
    next();
  }))
  .pipe( dbclient );

// pipe objects to stringify for debugging
// debug_fork = stringify();
// debug_fork.pipe( process.stdout );

fs.createReadStream( pbfFilePath )
  .pipe( parser )
  .pipe( stats( 'reader -> osm_types' ) )
  .pipe( osm_types({
    node:     node_fork,
    way:      way_fork,
    relation: devnull(),
  }))
;
