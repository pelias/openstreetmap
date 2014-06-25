
// http://wiki.openstreetmap.org/wiki/UK_Food_Hygiene_Rating_System

module.exports = function( node, record ){

  if( node.tags ){

    // remove all fhrs tags
    for( var tag in node.tags ){
      if( tag.match('fhrs:') ){
        delete node.tags[tag];
      }
    }
  
  }

};