
var through = require('through2');

var mapper = through.obj( function( way, enc, done ) {
  
  if( !way.id || !way.refs.length ) return done();
  if( !way.tags || !way.tags.name ) return done();
  if( way.info && way.info.visible === 'false' ) return done();

  var record = {
    id: way.id,
    refs: way.refs
  };

  if( way.tags ){
    record.tags = way.tags;
    if( way.tags.name ){
      record.name = way.tags.name;
    }
  }

  // remove rubbish tags
  delete way.tags['created_by'];
  delete way.tags['name'];
  delete way.tags['FIXME'];

  // remove dates
  for( var tag in way.tags ){
    if( tag.match('date') ){
      delete way.tags[tag];
    }
  }

  this.push( record, enc );
  done();

});

module.exports = mapper;