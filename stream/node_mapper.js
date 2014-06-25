
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
  
  if( !node || !node.hasOwnProperty('id')
            || !node.hasOwnProperty('lat')
            || !node.hasOwnProperty('lon') ) return done();

  var record = {};

  mappers.forEach( function( mapper ){
    mapper( node, record );
  });

  this.push( record, enc );
  done();

});

module.exports = stream;