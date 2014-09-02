
// deprecated

// var osmread = require('../static_modules/osm-read');
// var PassThrough = require('stream').PassThrough;

// module.exports = function( filepath ){

//   var stream = new PassThrough({ objectMode: true });
//   console.log( 'parse', filepath );

//   osmread.parse({
//     filePath: filepath,
//     endDocument: function(){
//       console.log( 'endDocument' );
//       stream.close();
//     },
//     bounds: function( item, next ){
//       // process.stdout.write('B');
//       item.type = 'bounds';
//       stream.write( item, 'utf8', next );
//     },
//     node: function( item, next ){
//       // process.stdout.write('N');
//       item.type = 'node';
//       stream.write( item, 'utf8', next );
//     },
//     way: function( item, next ){
//       // process.stdout.write('W');
//       item.type = 'way';
//       stream.write( item, 'utf8', next );
//     },
//     relation: function( item, next ){
//       // process.stdout.write('R');
//       item.type = 'relation';
//       stream.write( item, 'utf8', next );
//     },
//     error: function( msg ){
//       console.error( msg );
//     }
//   });
  
//   // catch stream errors
//   stream.on( 'error', console.error.bind( console, __filename ) );

//   return stream;
// }