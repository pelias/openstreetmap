
var through = require('through2'),
    esclient = require('pelias-esclient')(),
    DEBUG = false;

var stream = through.obj( function( item, enc, done ) {

  // Skip lookup if record already has geo info
  if( item.admin0 && item.admin1 && item.admin2 ){
    this.push( item, enc ); // Forward record down the pipe
    return done(); // ACK and take next record from the inbound stream
  }

  // Search ES for the nearest geonames record to this items center point
  esclient.search( buildSearchQuery( item.center_point ), function ( error, resp ) {

    // Response logger
    if( DEBUG ){
      console.error( 'response time:', resp.took + 'ms' );
      console.error( JSON.stringify( resp, null, 2 ) );
    }

    // Log errors from the es client
    if( error ){ console.error( 'eclient error: geonames lookup', error ); }

    // Check the response is valid ang contains at least one records
    else if( 'object' == typeof resp && resp.hasOwnProperty('hits') && 
        Array.isArray( resp.hits.hits ) && resp.hits.hits.length ){

      // We only need the document fields
      var hit = resp.hits.hits[0].fields;

      // This should never happen but was reported in the wild
      // please report this bug if you see it again
      if( !hit ){
        console.error( 'unexpected: invalid fields returned' );
        console.error( JSON.stringify( resp, null, 2 ) );
      }

      // It's possible (albeit very unlikely) that the record we found
      // contains no admin hierarchy at all
      else if( !hit.admin0 && !hit.admin1 && !hit.admin2 ){
        console.error( 'incomplete: geonames record contained no admin hierarchy' );
      }

      // Copy admin data from the geonames record to the osm record
      else {
        if( hit.admin0 ){ item.admin0 = hit.admin0[0]; }
        if( hit.admin1 ){ item.admin1 = hit.admin1[0]; }
        if( hit.admin2 ){ item.admin2 = hit.admin2[0]; }
      }
    }

    // The query returned 0 results
    else { console.error( 'miss: failed geonames lookup' ); }
   
    this.push( item, enc ); // Forward record down the pipe
    return done(); // ACK and take next record from the inbound stream

  }.bind(this));

});

// Build an elasticsearch query to augment the osm record with
// admin hierarchy info from the nearest geonames record
var buildSearchQuery = function( centroid ){
  return {
    index: 'pelias',
    type: 'geoname',
    body: {
      "fields": [ "admin0", "admin1", "admin2" ], // Only return fields related to admin hierarchy
      "query": {
        "filtered": {
          "query": {
            "match_all": {}
          },
          "filter" : {
            "bool": {
              "must": [
                // {
                //   "geohash_cell": {
                //     "center_point": item.center_point,
                //     "precision": 12, // @note: setting this higher than 5 causes loads of misses!?
                //                      // ...and setting it around 5 is very very slow.
                //     "neighbors": true
                //   }
                // },
                {
                  "geo_distance" : {
                    "distance": "50km",
                    "distance_type": "plane",
                    "optimize_bbox": "indexed",
                    "center_point": {
                      "lat": Number( centroid.lat ).toFixed(2), // @note: make filter cachable
                      "lon": Number( centroid.lon ).toFixed(2)  // precision max ~1.113km off
                    },
                    "_cache": true // Speed up duplicate queries. Memory impact?
                  }
                }
              ]
            }
          }
        }
      },
      "sort": [{
        "_geo_distance": {
          "center_point": centroid,
          "order": "asc",
          "unit": "km"
        }
      }],
      "size": 1
    }
  };
}

module.exports = stream;