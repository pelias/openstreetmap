
module.exports = function( item, record ){

  // osm id
  record.id = item.id;
  
  // set lat/lon
  if( item.hasOwnProperty('lat') && item.hasOwnProperty('lon') ){
    record.center_point = {
      lat: item.lat,
      lon: item.lon
    };
  }

  if( item.hasOwnProperty('refs') ){
    record.refs = item.refs;
  }

  record.name = {};
  record.type = item.type;

  // copy all tags
  record.tags = item.tags;

  if( item.nodes ){
    record.nodes = item.nodes;
  }

};