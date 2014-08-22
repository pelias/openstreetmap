
var through = require('through2');
var osm_names = require('../mapper/node/osm_names');
var osm_rubbish = require('../mapper/node/osm_rubbish');

module.exports = function(){

  var stream = through.obj( function( way, enc, done ) {

    if( !way || !way.id ){ return done(); }
    if( !Array.isArray( way.refs ) || !way.refs.length ){ return done(); }
    if( 'object' !== typeof way.tags ){ return done(); }
    if( !way.tags.name ){ return done(); }
    // if( way.info && way.info.visible === 'false' ) return done();

    var record = {
      id: way.id,
      refs: way.refs,
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

    this.push( record, enc );
    done();

  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}