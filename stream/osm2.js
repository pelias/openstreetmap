
var osmread = require('osm-read');
var Transform = require('stream').Transform;

module.exports = function( filepath ){

  var buffer = [];
  var stream = new Transform({ objectMode: true });
  stream._transform = function( chunk, encoding, done ){
    if( buffer.length < 1000 ){
      buffer.push( chunk );
    }
    else {
      this.push( buffer, encoding );
      buffer = [];
    }
    done();
  }

  console.log( 'parse', filepath );
  osmread.parse({
    filePath: filepath,
    endDocument: function(){
      console.log( 'eof' );
    },
    bounds: function(bounds){
      console.log( 'bounds' );
    },
    node: function(node){
      node.type = 'node';
      // @todo: info.visible
      stream.write( node, 'utf8' );
    },
    way: function(way){
      way.type = 'way';
      way.refs = way.nodeRefs;
      delete way.nodeRefs;
      // @todo: info.visible
      stream.write( way, 'utf8' );
    },
    error: function(msg){
      console.error( msg );
      //stream.emit( 'error', msg );
    }
  });

  return stream;
}