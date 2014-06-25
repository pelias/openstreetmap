
var through = require('through2');
var esclient = require('pelias-esclient')();
require( '../util/debugstats' )( esclient.stream );

module.exports = function( index, type ){

  return through.obj( function( node, enc, done ) {
    
    var id = node.id;
    delete node.id;

    esclient.stream.write({
      _index: index, _type: type, _id: id,
      data: node
    }, done );

  });

}