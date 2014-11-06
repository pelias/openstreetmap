
var util = require('util'),
    osmium = require('osmium'),
    Readable = require('readable-stream');

function OsmiumStream( filename, readerOpts, fileOpts ){
  Readable.call( this, { objectMode: true } );
  this.file = new osmium.File( filename );
  this.reader = new osmium.Reader( this.file, readerOpts );
  this._internalBuffer = [];
}

util.inherits( OsmiumStream, Readable );

OsmiumStream.prototype._flush = function(){
  var flooding = false;
  while( !flooding ){
    var item = this._internalBuffer.shift();
    if( !item ){ return true; }

    flooding = !!this.push( item );
    if( flooding ){ return false; }
  }
  return true;
};

OsmiumStream.prototype._next = function(){
  // wait for drain
  if( !this._flush() ){ return; }

  var buffer = this.reader.read();

  // end of file
  if( !buffer ){ return this._end(); }

  this._extractBuffer( buffer, [], function( extracted ){
    this._internalBuffer = this._internalBuffer.concat( extracted );
    this._next();
  }.bind(this));
};

OsmiumStream.prototype._end = function(){
  this.push( null );
};

OsmiumStream.prototype._extractBuffer = function( buffer, extracted, done ){
  var object = buffer.next();
  if( !object ) return done( extracted ); //done
  extracted.push( this._mapRecord( object ) );
  setImmediate( this._extractBuffer.bind( this, buffer, extracted, done ) );
};

OsmiumStream.prototype._mapRecord = function( object ){
  if( object instanceof osmium.Node ){    
    return {
      type: 'node',
      id: object.id,
      lat: object.lat,
      lon: object.lon,
      tags: object.tags(),
      info: {}
    };
  }
  else if( object instanceof osmium.Way ){
    return {
      type: 'way',
      id: object.id,
      refs: object.node_refs(),
      tags: object.tags(),
      info: {}
    };
  } else {
    console.log( 'unkown type', object.constructor.name );
    return null;
  }
};

OsmiumStream.prototype._read = function(){
  this._next();
};

module.exports = OsmiumStream;