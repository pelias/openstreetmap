
module.exports = function( item, record ){

  if( item.tags ){

    var keys = Object.keys( item.tags );
    var rubbish = [ 'created_by', 'fixme', 'randomjunk_bot' ];

    // remove rubbish tags (case insensitive)
    for( var x=0; x<rubbish.length; x++ ){
      for( var y=0; y<keys.length; y++ ){
        var regex = new RegExp( '^' + rubbish[x] + '$', 'i' );
        if( keys[y].match( regex ) ){
          delete item.tags[ keys[y] ];
        }
      }
    }

    // remove dates
    for( var tag in item.tags ){
      if( tag.match('date') ){
        delete item.tags[tag];
      }
    }
  }

};