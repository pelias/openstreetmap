
var through = require('through2');
var esclient = require('pelias-esclient')();

var stream = through.obj( function( item, enc, done ) {

  esclient.search({
    index: 'pelias',
    type: 'geoname',
    body: {
      "query": {
        "filtered": {
          "query": {
            "match_all": {}
          },
          "filter" : {
            "geo_distance" : {
              "distance": "200km",
              "distance_type": "plane",
              "optimize_bbox": "indexed",
              "center_point": item.center_point
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

    if( !error && 'object' == typeof resp && resp.hasOwnProperty('hits') && 
        Array.isArray( resp.hits.hits ) && resp.hits.hits.length ){

      var hit = resp.hits.hits[0]._source;
      item.admin0 = hit.admin0;
      item.admin1 = hit.admin1;
      item.admin2 = hit.admin2;
    }
   
    this.push( item, enc );
    done();

  }.bind(this));

});

module.exports = stream;