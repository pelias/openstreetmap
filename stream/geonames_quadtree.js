
var through = require('through2');
// var esclient = require('pelias-esclient')();

// @see: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-geohash-cell-filter.html

var stream = through.obj( function( item, enc, done ) {

  // skip lookup if we already have geo info
  if( item.admin0 && item.admin1 && item.admin2 ) return done();

  esclient.search({
    index: 'pelias',
    type: 'geoname',
    body: {
      "fields": [ "admin0", "admin1", "admin2" ],
      "query": {
        "filtered" : {
          "query" : {
            "match_all" : {}
          },
          "_cache": true, // @todo: is this caching? (new in ES 1.3.0)
          "filter" : {
            "geohash_cell": {
              "center_point": item.center_point,
              "precision": 12, // @note: setting this higher than 5 causes loads of misses!?
                               // ...and setting it around 5 is very very slow.
              "neighbors": true
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

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

});

module.exports = stream;