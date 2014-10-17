
var through = require('through2');

var mappers = [];
mappers.push( require('../mapper/item/basic') );
mappers.push( require('../mapper/item/osm_names') );
mappers.push( require('../mapper/item/osm_schema') );
mappers.push( require('../mapper/item/naptan_schema') );
mappers.push( require('../mapper/item/fhrs_schema') );
mappers.push( require('../mapper/item/karlsruhe_schema') );
mappers.push( require('../mapper/item/osm_rubbish') );

module.exports = function(){

  var stream = through.obj( function( item, enc, done ) {

    var record = {};

    mappers.forEach( function( mapper ){
      mapper( item, record );
    });

    this.push( record );

    done();

  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};