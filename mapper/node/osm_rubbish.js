
module.exports = function( node, record ){

  if( node.tags ){

    var keys = Object.keys( node.tags );
    var rubbish = [ 'created_by', 'fixme', 'randomjunk_bot' ];

    // remove rubbish tags (case insensitive)
    for( var x=0; x<rubbish.length; x++ ){
      for( var y=0; y<keys.length; y++ ){
        var regex = new RegExp( '^' + rubbish[x] + '$', 'i' );
        if( keys[y].match( regex ) ){
          delete node.tags[ keys[y] ];
        }
      }
    }

    // remove dates
    for( var tag in node.tags ){
      if( tag.match('date') ){
        delete node.tags[tag];
      }
    }
  }

};