
// var through = require('../../parallel'),
//     buildHierarchy = require('./buildHierarchy');

// function hierarchyLookup( backends, fallbackBackend ){

//   var stream = through.obj( function( item, enc, done ) {

//     var reply = function(){
//       this.push( item ); // Forward record down the pipe
//       return done(); // ACK and take next record from the inbound stream
//     }.bind(this);

//     // Skip lookup if record already has geo info
//     if( item.admin0 && item.admin1 && item.admin2 ){
//       return reply();
//     }

//     buildHierarchy( backends, item.center_point, function( error, result ){

//       // An error occurred
//       // @todo: this should never happen
//       if( error ){
//         console.error( 'hierarchyLookup error:', error );
//         return reply();
//       }

//       else if( !result ){
//         console.error( 'hierarchyLookup returned 0 results' );
//         return reply();
//       }

//       // Copy admin data to the osm record
//       else {
//         if( result.alpha3 ){ item.alpha3 = result.alpha3; }
//         if( result.admin0 ){ item.admin0 = result.admin0; }
//         if( result.admin1 ){ item.admin1 = result.admin1; }
//         if( result.admin1_abbr ){ item.admin1_abbr = result.admin1_abbr; }
//         if( result.admin2 ){ item.admin2 = result.admin2; }
//         if( result.local_admin ){ item.local_admin = result.local_admin; }
//         if( result.locality ){ item.locality = result.locality; }
//         if( result.neighborhood ){ item.neighborhood = result.neighborhood; }

//         // fallback to geonames hierachy
//         if( !item.admin0 || !item.admin1 || !item.admin2 ){
//           fallbackBackend.findAdminHeirachy( item.center_point, null, function ( error, resp ) {
//             if( Array.isArray( resp ) && resp.length ){
//               if( !item.alpha3 && resp[0].alpha3 ){ item.alpha3 = resp[0].alpha3; }
//               if( !item.admin0 && resp[0].admin0 ){ item.admin0 = resp[0].admin0; }
//               if( !item.admin1 && resp[0].admin1 ){ item.admin1 = resp[0].admin1; }
//               if( !item.admin2 && resp[0].admin2 ){ item.admin2 = resp[0].admin2; }
//             }
//             return reply();
//           });
//         }

//         else return reply();
//       }

//     }.bind(this));

//   });

//   // catch stream errors
//   stream.on( 'error', console.error.bind( console, __filename ) );

//   return stream;
// }

// module.exports = hierarchyLookup;