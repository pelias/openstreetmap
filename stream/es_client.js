
var through = require('through2');
var esclient = require('pelias-esclient')({ buffer: 1000 });
esclient.livestats();

module.exports = function( index, type ){

  return through.obj( function( item, enc, done ) {

    var id = item.id;
    delete item.id;

    // allow override of the default type
    // by setting ._type on the item.
    var estype = type;
    if( item.hasOwnProperty('_type') ) {
      estype = item._type;
      delete item._type;
    }

    esclient.stream.write({
      _index: index, _type: estype, _id: id,
      data: item
    }, done );

  });

}