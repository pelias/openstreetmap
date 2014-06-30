
var osmread = require('../static_modules/osm-read');
var PassThrough = require('stream').PassThrough;

module.exports = function( filepath ){

  var stream = new PassThrough({ objectMode: true });
  console.log( 'parse', filepath );

  osmread.parse({
    filePath: filepath,
    endDocument: function(){},
    bounds: function( item, next ){
      item.type = 'bounds';
      stream.write( item, 'utf8', next );
    },
    node: function( item, next ){
      item.type = 'node';
      stream.write( item, 'utf8', next );
    },
    way: function( item, next ){
      item.type = 'way';
      stream.write( item, 'utf8', next );
    },
    relation: function( item, next ){
      item.type = 'relation';
      stream.write( item, 'utf8', next );
    },
    error: function( msg ){
      console.error( msg );
    }
  });

  return stream;
}