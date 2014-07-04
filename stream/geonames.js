
var through = require('through2');
var esclient = require('pelias-esclient')();

var stream = through.obj( function( item, enc, done ) {

  // skip lookup if we already have geo info
  if( item.admin0 && item.admin1 && item.admin2 ) return done();

  esclient.search({
    index: 'pelias',
    type: 'geoname',
    body: {
      "fields": [ "admin0", "admin1", "admin2" ],
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
                      "lat": Number( item.center_point.lat ).toFixed(2), // @note: make filter cachable
                      "lon": Number( item.center_point.lon ).toFixed(2)  // precision max ~1.113km off
                    },
                    "_cache": true
                  }
                }
              ]
            }
          }
        }
      },
      "sort": [{
        "_geo_distance": {
          "center_point": item.center_point,
          "order": "asc",
          "unit": "km"
        }
      }],
      "size": 1
    }
  }, function (error, resp) {

    if( error ) console.error( error );

    // console.log( JSON.stringify( resp, null, 2 ) );

    if( !error && 'object' == typeof resp && resp.hasOwnProperty('hits') && 
        Array.isArray( resp.hits.hits ) && resp.hits.hits.length ){

      var hit = resp.hits.hits[0].fields;
      if( hit.admin0 ) item.admin0 = hit.admin0[0];
      if( hit.admin1 ) item.admin1 = hit.admin1[0];
      if( hit.admin2 ) item.admin2 = hit.admin2[0];
    }
   
    this.push( item, enc );
    done();

  }.bind(this));

});

module.exports = stream;