
var fs = require('fs'),
    through = require('through2'),
    pbf2json = require('pbf2json'),
    suggester = require('pelias-suggester-pipeline'),
    propStream = require('prop-stream'),
    settings = require('pelias-config').generate(),
    dbclient = require('pelias-dbclient')();

// geojson functions
var geoJsonCenter = require('./util/geoJsonCenter');
var geoJsonTypeFor = require('./util/geoJsonTypeFor');

// backend
var Backend = require('geopipes-elasticsearch-backend');
var createBackend = function( index, type ){
  return new Backend( dbclient.client, index, type );
};

// use datapath setting from your config file
var basepath = settings.imports.openstreetmap.datapath;
var filename = settings.imports.openstreetmap.import[0].filename;
var leveldbpath = settings.imports.openstreetmap.leveldbpath;
var pbfFilePath = basepath + '/' + filename;

// streams
var devnull =                  require('./stream/devnull');
var osm_mapper =               require('./stream/osm_mapper');
var address_extractor =        require('./stream/address_extractor');
var osm_types =                require('./stream/osm_types');
var hierarchyLookup =          require('./stream/osm/any/hierarchyLookup');

// enable/disable debugging of bottlenecks in the pipeline.
var stats =                    require('./stream/stats');
stats.enabled = true;

// sinks
var backend = {
  osmnode:                  createBackend('pelias', 'osmnode'),
  osmway:                   createBackend('pelias', 'osmway'),
  geonames:                 createBackend('pelias', 'geoname'),
  admin0:                   createBackend('pelias', 'admin0'),
  admin1:                   createBackend('pelias', 'admin1'),
  admin2:                   createBackend('pelias', 'admin2'),
  local_admin:              createBackend('pelias', 'local_admin'),
  locality:                 createBackend('pelias', 'locality'),
  neighborhood:             createBackend('pelias', 'neighborhood')
};

// entry point for node pipeline
node_fork = stats( 'osm_types -> node_mapper' );
node_fork

  // map and filter records
  .pipe( osm_mapper() )
  .pipe( stats( 'node_mapper -> node_hierarchyLookup' ) )

  // hierarchy lookup
  .pipe( hierarchyLookup([
    { type: 'neighborhood'  , adapter: backend.neighborhood },
    { type: 'locality'      , adapter: backend.locality },
    { type: 'local_admin'   , adapter: backend.local_admin },
    { type: 'admin2'        , adapter: backend.admin2 },
    { type: 'admin1'        , adapter: backend.admin1 },
    { type: 'admin0'        , adapter: backend.admin0 }
  ], backend.geonames ))
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
      _type: item._meta.type,
      _id: id,
      data: item
    });
    next();
  }))
  .pipe( stats( 'es_node_dbclient_mapper -> node_dbclient' ) )
  .pipe( dbclient );

// entry point for way pipeline
way_fork = stats( 'osm_types -> way_mapper' );
way_fork

  // map and filter records
  .pipe( osm_mapper() )
  .pipe( stats( 'way_mapper -> way_denormalizer' ) )

  // convert de-normalized ways to geojson
  .pipe( through.obj( function( item, enc, next ){
    try {

      if( !item.nodes ){
        return next();
      }

      var points = item.nodes.map( function( doc ){
        return [ doc.lon, doc.lat ];
      });

      var geo = {
        type: geoJsonTypeFor( points ),
        coordinates: points
      };

      item.center_point = geoJsonCenter( geo );
      delete item.nodes;

      this.push( item );
      next();

    } catch( e ){
      console.log( 'failed to denormalize way', e );
      process.exit( 1 );
    }
  }))
  .pipe( stats( 'way_denormalizer -> way_hierarchyLookup' ) )

  // hierarchy lookup
  .pipe( hierarchyLookup([
    { type: 'neighborhood'  , adapter: backend.neighborhood },
    { type: 'locality'      , adapter: backend.locality },
    { type: 'local_admin'   , adapter: backend.local_admin },
    { type: 'admin2'        , adapter: backend.admin2 },
    { type: 'admin1'        , adapter: backend.admin1 },
    { type: 'admin0'        , adapter: backend.admin0 }
  ], backend.geonames ))
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
      _type: item._meta.type,
      _id: id,
      data: item
    });
    next();
  }))
  .pipe( stats( 'es_way_dbclient_mapper -> way_dbclient' ) )
  .pipe( dbclient );

// -- parser --

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

var tags = ['addr:housenumber+addr:street']; // streets
require('./features').features.forEach( function( feature ){
  tags.push( feature + '+name' ); // has feature and valid name
});

var config = {
  file: pbfFilePath,
  tags: tags,
  leveldb: leveldbpath
};

pbf2json.createReadStream( config )
  .pipe( stats( 'osmium_mapper -> osm_types' ) )
  .pipe( osm_types({
    node:     node_fork,
    way:      way_fork,
    relation: devnull(),
  }));