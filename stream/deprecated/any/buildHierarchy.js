
// var async = require('async');

// function build( backends, centroid, done ){

//   var hierarchy = {};
//   var opts = {
//     type: 'shape-point',
//     fields: [ 'name.default', 'alpha3', 'admin1_abbr' ],
//     strict: false
//   };

//   async.reduce( backends, hierarchy, callback.bind( this, centroid, opts ), done );

// }

// function callback( centroid, opts, memo, backend, cb ){
//   backend.adapter.findAdminHeirachy( centroid, opts, function ( error, resp ) {
//     if( resp && resp.length ){
//       // map name
//       if( resp[0]['name.default'] ){
//         memo[backend.type] = resp[0]['name.default'];
//       }
//       // map alpha3
//       if( !memo.hasOwnProperty('alpha3') && resp[0]['alpha3'] ){
//         memo['alpha3'] = resp[0]['alpha3'];
//       }
//       // map admin1_abbr
//       if( !memo.hasOwnProperty('admin1_abbr') && resp[0]['admin1_abbr'] ){
//         memo['admin1_abbr'] = resp[0]['admin1_abbr'];
//       }
//     }
//     // @todo: error not being bubbled up!
//     // due to async.reduce failing on first error
//     cb( undefined, memo );
//   });
// }

// module.exports = build;