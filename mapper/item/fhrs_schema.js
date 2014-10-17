
// http://wiki.openstreetmap.org/wiki/UK_Food_Hygiene_Rating_System

module.exports = function( item, record ){

  if( item.tags ){

    // remove all fhrs tags
    for( var tag in item.tags ){
      if( tag.match('fhrs:') ){
        delete item.tags[tag];
      }
    }
  
  }

};