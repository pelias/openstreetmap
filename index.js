
var fs = require('fs'),
    levelup = require('levelup'),
    multilevel = require('level-multiply'),
    parser = require('osm-pbf-parser')(),
    through = require('through2'),
    suggester = require('pelias-suggester-pipeline'),
    propStream = require('prop-stream'),
    settings = require('pelias-config').generate(),
    dbclient = require('pelias-dbclient')(),
    OsmiumStream = require('osmium-stream');

var geoJsonCenter = require('./util/geoJsonCenter');
var geoJsonTypeFor = require('./util/geoJsonTypeFor');

// nullclient
// !!!!! DELETE ME, TESTING ONLY
// var nullclient = through.obj( function( o, e, n ){
//   n();
// }, function(){
//   dbclient.end();
// });

var Backend = require('geopipes-elasticsearch-backend');

// esclient.livestats();

var backend = function( index, type ){
  return new Backend( dbclient.client, index, type );
};

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
    osmnode:                  backend('pelias', 'osmnode'),
    osmway:                   backend('pelias', 'osmway'),
    geonames:                 backend('pelias', 'geoname'),
    admin0:                   backend('pelias', 'admin0'),
    admin1:                   backend('pelias', 'admin1'),
    admin2:                   backend('pelias', 'admin2'),
    local_admin:              backend('pelias', 'local_admin'),
    locality:                 backend('pelias', 'locality'),
    neighborhood:             backend('pelias', 'neighborhood')
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
var address_extractor =        require('./stream/address_extractor');

//var quattroshapes =            require('./stream/quattroshapes');
var exit_on_id =               require('./stream/exit_on_id');
var stats =                    require('./stream/stats');

// enable/disable debugging of bottlenecks in the pipeline.
stats.enabled = true;

// entry point for node pipeline
node_fork = stats( 'osm_types -> node_mapper' );
node_fork

  // map and filter records
  // .pipe( osm_filter() )
  // .pipe( stats( 'node_filter -> node_mapper' ) )
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

  // .pipe( suggester.pipeline )
  .pipe( suggester.streams.suggestable() )
  .pipe( suggester.streams.suggester( suggester.generators ) )

  .pipe( stats( 'node_suggester -> node_whitelist' ) )

  // remove tags not in schema (or throws StrictDynamicMappingException)
  // note: 'tags' are being stripped to reduce db size
  .pipe( propStream.whitelist(['id','name','address','type','alpha3','admin0','admin1','admin1_abbr','admin2','local_admin','locality','neighborhood','center_point','suggest']) )

  .pipe( stats( 'node_blacklist -> es_node_dbclient_mapper' ) )
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
  .pipe( stats( 'es_node_dbclient_mapper -> node_dbclient' ) )
  .pipe( dbclient );
  // .pipe( nullclient );
  // .pipe( backend.es.osmnode.createPullStream() );

// entry point for way pipeline
way_fork = stats( 'osm_types -> way_mapper' );
way_fork

  // map and filter records
  // .pipe( osm_filter() )
  // .pipe( stats( 'way_filter -> way_mapper' ) )
  .pipe( osm_mapper() )
  .pipe( stats( 'way_mapper -> way_denormalizer' ) )

  .pipe( through.obj( function( item, enc, next ){

    // console.log( 'way', item.nodes );
    // console.log( 'way', item );
    // process.exit(1);
    try {

      if( !item.nodes ){
        return next();
      }

      var points = item.nodes.map( function( doc ){
        return [ doc.lon, doc.lat ];
      });

      item.geo = {
        type: geoJsonTypeFor( points ),
        coordinates: points
      };

      item.center_point = geoJsonCenter( item.geo );
      delete item.nodes;

      this.push( item );

      next();

    } catch( e ){
      console.log(e);
      process.exit();
    }
  }))
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

  // .pipe( suggester.pipeline )
  .pipe( suggester.streams.suggestable() )
  .pipe( suggester.streams.suggester( suggester.generators ) )

  .pipe( stats( 'way_suggester -> way_blacklist' ) )

  // remove tags not in schema (or throws StrictDynamicMappingException)
  // note: 'tags' are being stripped to reduce db size
  .pipe( propStream.whitelist(['id','name','address','type','alpha3','admin0','admin1','admin1_abbr','admin2','local_admin','locality','neighborhood','center_point','suggest']) )

  .pipe( stats( 'way_blacklist -> es_way_dbclient_mapper' ) )
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
  .pipe( stats( 'es_way_dbclient_mapper -> way_dbclient' ) )
  .pipe( dbclient );
  // .pipe( nullclient );
  // .pipe( backend.es.osmway.createPullStream() );

// pipe objects to stringify for debugging
// debug_fork = stringify();
// debug_fork.pipe( process.stdout );

process.stdin.on('end',function(){
  console.log( 'stdin end' );
  // process.exit(1);
});

process.stdin
  .pipe( require('split')() )
  .pipe( through.obj( function( chunk, enc, next ){
    try {
      var o = JSON.parse( chunk.toString('utf8') );
      if( o ) this.push( o );
    }
    catch( e ){
      console.log( 'stream end' );
      // console.log( chunk, e, o );
      // console.log(e, e.stack);
      // console.log(e, o, typeof o, chunk.toString('utf8'));
      // process.exit(1);
      // this.end();
    }
    finally {
      next();
    }
  }))

// var file = new OsmiumStream.osmium.File( pbfFilePath );
// var reader = new OsmiumStream.osmium.Reader( file, { node: true, way: true } );
// var parser = new OsmiumStream( reader );
// parser

  .pipe( stats( 'osmium_mapper -> osm_types' ) )
  .pipe( osm_types({
    node:     node_fork,
    way:      way_fork,
    relation: devnull(),
  }))
;

// fs.createReadStream( pbfFilePath ).pipe(parser);


// var osmium = require('osmium');
// var file = new osmium.File( pbfFilePath );
// var reader = new osmium.Reader(file, { node: true, way: true });

// function extract( object ){
//   if( object instanceof osmium.Node ){
//     return {
//       type: 'node',
//       id: object.id,
//       lat: object.lat,
//       lon: object.lon,
//       tags: object.tags()
//     };
//   } else if( object instanceof osmium.Way ){
//     return {
//       type: 'way',
//       id: object.id,
//       refs: object.node_refs(),
//       tags: object.tags()
//     };
//   } else if( object instanceof osmium.Relation ){
//     return {
//       type: 'relation',
//       id: object.id
//     };
//   } else {
//     console.log( 'unkown type', object.constructor.name );
//     return null;
//   }
// }

// var mapper = stats( 'osmium_mapper -> osm_types' );
// mapper.pipe( osm_types({
//   node:     node_fork,
//   way:      way_fork,
//   relation: devnull(),
// }));

// var handler = new osmium.Handler();
// handler.on('node', function(node) {
//   mapper.write( extract( node ) );
// });
// handler.on('way', function(way) {
//   mapper.write( extract( way ) );
// });

// osmium.apply(reader, handler);