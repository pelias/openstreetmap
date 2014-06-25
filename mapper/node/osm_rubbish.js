
module.exports = function( node, record ){

  if( node.tags ){

    // remove rubbish tags
    delete node.tags['created_by'];
    delete node.tags['FIXME'];

    // remove dates
    for( var tag in node.tags ){
      if( tag.match('date') ){
        delete node.tags[tag];
      }
    }
  }

};