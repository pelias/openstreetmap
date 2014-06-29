
var through = require('through2');
var esclient = require('pelias-esclient')({ buffer: 1000 });
esclient.livestats();

module.exports = function( index, type ){

  return through.obj( function( item, enc, done ) {

    var id = item.id;
    delete item.id;

    esclient.stream.write({
      _index: index, _type: type, _id: id,
      data: item
    }, done );

  });

}