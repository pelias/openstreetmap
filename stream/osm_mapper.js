
var through = require('through2');
var Document = require('pelias-model').Document;

var mappers = [];
mappers.push( require('../mapper/item/osm_names') );
mappers.push( require('../mapper/item/osm_schema') );
mappers.push( require('../mapper/item/naptan_schema') );
mappers.push( require('../mapper/item/karlsruhe_schema') );

module.exports = function(){

  var stream = through.obj( function( doc, enc, done ) {

    mappers.forEach( function( mapper ){
      mapper( doc );
    });

    this.push( doc );

    done();

  });
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};