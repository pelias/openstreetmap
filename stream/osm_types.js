
var through = require('through2');

function filterTypeStream( type ){
  var stream = through.obj( function( data, enc, next ) {

    // data is an array of items
    if( Array.isArray( data ) ){
      data.forEach( function( item ){
        if( item.type === type ){
          this.push( item );
        }
      }, this);
    }

    // data is a single item
    else {
      if( data.type === type ){
        this.push( data );
      }
    }

    next();

  });
  return stream;
}

module.exports = function( streams ){
  if( !streams || !streams.node || !streams.way || !streams.relation ){
    throw new Error( 'invalid types stream constructor' );
  }

  var node_stream = filterTypeStream( 'node' );
  node_stream.pipe( streams.node );

  var way_stream = filterTypeStream( 'way' );
  way_stream.pipe( streams.way );

  // var seenWays = false;
  // way_stream.pipe( through.obj( function( i, e, n ){
  //   if( !seenWays ){
  //     streams.node.end();
  //     seenWays = true;
  //   }
  //   n();
  // }));

  var relation_stream = filterTypeStream( 'relation' );
  relation_stream.pipe( streams.relation );

  // simple passthrough stream
  var stream = through.obj( function( data, enc, next ) {
    this.push( data );
    next();
  });

  // pipe to each filter stream
  stream.pipe( node_stream );
  stream.pipe( way_stream );
  stream.pipe( relation_stream );
  
  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};