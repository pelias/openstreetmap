
var through = require('through2');
var osm_names = require('../mapper/node/osm_names');
var osm_rubbish = require('../mapper/node/osm_rubbish');

module.exports = function(){

  var stream = through.obj( function( way, enc, done ) {

    // console.log( JSON.stringify( way, null, 2 ) );
    // process.exit(1);

    if( way && (''+way.id) == '79338918' ){ // city farm
      console.error( 'city farm!' );
      console.error( JSON.stringify( way, null, 2 ) );
    }
    
    if( !way || !way.id ){ return done(); }
    if( !Array.isArray( way.nodeRefs ) || !way.nodeRefs.length ){ return done(); }
    if( 'object' !== typeof way.tags ){ return done(); }
    if( !way.tags.name ){ return done(); }
    // if( way.info && way.info.visible === 'false' ) return done();

    var record = {
      id: way.id,
      refs: way.nodeRefs,
      type: 'way'
    };

    if( way.tags ){
      record.tags = way.tags;
      if( way.tags.name ){
        record.name = {
          default: way.tags.name
        }
      }
    }

    // fix names
    osm_names( way, record );

    // remove rubbish tags
    osm_rubbish( record );

    if( way && (''+way.id) == '79338918' ){ // city farm
      console.error( 'city farm push' );
      console.error( JSON.stringify( record, null, 2 ) );
    }

    this.push( record, enc );
    done();

  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}