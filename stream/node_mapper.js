
var through = require('through2');

var mappers = [];
mappers.push( require('../mapper/node/basic') );
mappers.push( require('../mapper/node/osm_names') );
mappers.push( require('../mapper/node/osm_schema') );
mappers.push( require('../mapper/node/naptan_schema') );
mappers.push( require('../mapper/node/fhrs_schema') );
mappers.push( require('../mapper/node/karlsruhe_schema') );
mappers.push( require('../mapper/node/osm_rubbish') );

var stream = through.obj( function( node, enc, done ) {

  var record = {};

  mappers.forEach( function( mapper ){
    mapper( node, record );
  });

  // remove nodes which don't have a valid name
  // if( 'object' == typeof record.name && Object.keys( record.name ).length ){
  //   this.push( record, enc );
  // }

  this.push( record );

  done();

});

module.exports = stream;