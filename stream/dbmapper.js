
var through = require('through2');

function databaseMapper(){
  return through.obj( function( doc, enc, next ){
    this.push({
      _index:   'pelias',
      _id:      doc.getId(),
      _type:    doc.getType(),
      data:     doc
    });
    next();
  });
}

module.exports = databaseMapper;