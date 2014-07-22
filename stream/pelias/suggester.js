 
var through = require('through2'),
    features = require('../../features');

var prefixes = [ 'the' ];

module.exports = function(){

  var stream = through.obj( function( record, enc, done ) {

    // Skip suggester for nodes without a name
    if( !record.name || !record.name.default ){
      this.push( record, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream
    }

    // Skip lookups for records which will not end up in our search index
    // @todo: refactor this
    if( record._type && record._type === 'osmpoint' ){
      this.push( record, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream
    }

    // Don't add suggestion data for records which aren't in
    // the list of desirable features.
    if( !features.getFeature( record ) ){
      this.push( record, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream
    }

    record.suggest = {
      input: [],
      output: '',
      payload: {
        id: 'osm' + record.type + '/' + record.id
      }
    }

    // inputs
    record.suggest.input.unshift( record.name.default.toLowerCase() );
    for( var attr in record.name ){
      var name = record.name[ attr ].toLowerCase();
      record.suggest.input.push( name );
    }

    // allow users to exclude certain common prefixes
    // we search for names beginning with known prefixes
    // and followed by a space.
    // If one is found then we add a copy of that name
    // sans the prefix to the list of inputs
    for( var x=0; x<record.suggest.input.length; x++ ){
      var input = record.suggest.input[x];
      for( var y=0; y<prefixes.length; y++ ){
        var prefix = prefixes[y];
        if( input.substr( 0, prefix.length+1 ) == prefix+' ' ){
          record.suggest.input.push( input.substr( prefix.length+1 ) );
        }
      }
    }

    // de-dupe inputs
    record.suggest.input = record.suggest.input.filter( function( input, pos ) {
      return record.suggest.input.indexOf( input ) == pos;
    });

    // payload
    var adminParts = [];
    record.suggest.payload.geo = record.center_point.lon + ',' + record.center_point.lat;
    
    if( record.admin2 && record.admin2.length ){
      adminParts.push( record.admin2 );
    }
    else if( record.admin1 && record.admin1.length ){
      adminParts.push( record.admin1 );
    }
    if( record.admin0 && record.admin0.length ){
      adminParts.push( record.admin0 );
    }

    // set output
    record.suggest.output = [ record.name.default ].concat( adminParts ).join(', ').trim();

    // add admin info to input values
    // so they are: "name admin2 admin1 admin0"
    // instead of simply: "name"
    // record.suggest.input = record.suggest.input.map( function( name, i ){
    //   // Set output to the default name
    //   if( i === 0 ){
    //     record.suggest.output = [ name ].concat( adminParts ).join(', ').trim();
    //   }
    //   return [ name ].concat( adminParts ).join(' ').trim();
    // });

    this.push( record, enc );
    done();

  });

  return stream;
}