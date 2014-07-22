
var Backend = require('geopipes-elasticsearch-backend'),
    esclient = require('pelias-esclient')({ throttle: 20 });

esclient.livestats();

module.exports = function( index, type ){
  return new Backend( esclient, index, type )
}