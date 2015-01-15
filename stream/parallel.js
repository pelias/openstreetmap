
var parallelStream = require('writable-stream-parallel');

var through = { obj: function( xform, flush ){

  var stream = new parallelStream.Transform({ objectMode: true, maxWrites: 40 });
  
  stream._transform = xform;
  if( 'function' == typeof flush ) stream._flush = flush;

  return stream;
}};

module.exports = through;