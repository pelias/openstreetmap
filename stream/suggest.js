
var through = require('through2');

var stream = through.obj( function( record, enc, done ) {

  record.suggest = {
    input: [],
    output: '',
    payload: {
      id: 'osm' + record.type + '/' + record.id
    }
  }

  // inputs
  record.suggest.input.unshift( record.name.default );
  for( var attr in record.name ){
    var name = record.name[ attr ];
    if( -1 == record.suggest.input.indexOf( attr ) ){
      record.suggest.input.push( attr );
    }
  }

  // payload
  var adminParts = [];
  record.suggest.payload.geo = record.center_point.lon + ',' + record.center_point.lat;
  
  if( record.admin2 && record.admin2.length ){
    adminParts.push( record.admin2 );
  }

  // add admin info to input values
  // so they are: "name admin2 admin1 admin0"
  // instead of simply: "name"
  record.suggest.input = record.suggest.input.map( function( name, i ){
    // Set output to the default name
    if( i === 0 ){
      record.suggest.output = [ name ].concat( adminParts ).join(', ').trim();
    }
    return [ name ].concat( adminParts ).join(' ').trim();
  });

  this.push( record, enc );
  done();

});

module.exports = stream;