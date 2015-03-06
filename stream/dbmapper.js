
/**
  The dbmapper is responsible for wrapping a document in an envelope which
  conforms to the input format for the pelias/dbclient library to consume.
**/

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