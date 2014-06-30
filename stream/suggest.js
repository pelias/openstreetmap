
var through = require('through2');

var stream = through.obj( function( record, enc, done ) {

  record.suggest = {
    input: [],
    payload: {
      type: 'osm'
    }
  }

  // inputs
  for( var attr in record.name ){
    if( -1 == record.suggest.input.indexOf( record.name[ attr ] ) ){
      record.suggest.input.unshift( record.name[ attr ] );
    }
  }

  // payload
  record.suggest.payload.name = record.name.default;
  record.suggest.payload.geo = record.center_point.lon + ',' + record.center_point.lat;
  
  if( record.admin2 && record.admin2.length ){
    record.suggest.payload.admin2 = record.admin2;
  }
  if( record.admin1 && record.admin1.length ){
    record.suggest.payload.admin1 = record.admin1;
  }
  if( record.admin0 && record.admin0.length ){
    record.suggest.payload.admin0 = record.admin0;
  }
 
  this.push( record, enc );
  done();

});

module.exports = stream;