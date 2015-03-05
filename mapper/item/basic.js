
module.exports = function( doc, item ){
  
  // set lat/lon
  if( item.hasOwnProperty('lat') && item.hasOwnProperty('lon') ){
    doc.setCentroid({
      lat: item.lat,
      lon: item.lon
    });
  }

  // if( item.hasOwnProperty('refs') ){
  //   doc.setMeta( 'refs', item.refs );
  // }

  // store address data
  doc.address = {};

  if( item.hasOwnProperty('nodes') ){
    doc.setMeta( 'nodes', item.nodes );
  }

  doc.setMeta( 'tags', item.tags );

};