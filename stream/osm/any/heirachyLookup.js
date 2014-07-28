
var through = require('through2')

function heirachyLookup( backend ){

  var stream = through.obj( function( item, enc, done ) {

    // Skip lookup for nodes without a name
    if( !item.name || !item.name.default ){
      this.push( item, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream
    }

    // Skip lookup if record already has geo info
    if( item.admin0 && item.admin1 && item.admin2 ){
      this.push( item, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream
    }

    // Skip lookups for records which will not end up in our search index
    // @todo: refactor this
    if( item._type && item._type === 'osmpoint' ){
      this.push( item, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream
    }

    // Search ES for the nearest geonames record to this items center point
    backend.findAdminHeirachy( item.center_point, null, function ( error, resp ) {

      // An error occurred
      if( error ){
        console.error( 'heirachyLookup error:', error );
      }

      else if( !resp || !resp.length ){
        console.error( 'heirachyLookup returned 0 results' );
      }

      // Copy admin data from the geonames record to the osm record
      else {
        var fields = resp[0];
        if( fields.admin0 ){ item.admin0 = fields.admin0; }
        if( fields.admin1 ){ item.admin1 = fields.admin1; }
        if( fields.admin2 ){ item.admin2 = fields.admin2; }
      }
     
      this.push( item, enc ); // Forward record down the pipe
      return done(); // ACK and take next record from the inbound stream

    }.bind(this));

  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}

module.exports = heirachyLookup;