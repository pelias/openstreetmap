
module.exports = function( item, record ){
  
  // set lat/lon
  if( item.hasOwnProperty('lat') && item.hasOwnProperty('lon') ){
    record.setCentroid({
      lat: item.lat,
      lon: item.lon
    });
  }

  // if( item.hasOwnProperty('refs') ){
  //   record.setMeta( 'refs', item.refs );
  // }

  if( item.hasOwnProperty('nodes') ){
    record.setMeta( 'nodes', item.nodes );
  }

  record.setMeta( 'tags', item.tags );

};