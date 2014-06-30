var protoBuf = require("protobufjs");
var zlib, buf, reader;

zlib = require('./lib/nodejs/zlib.js');
buf = require('./lib/nodejs/buffer.js');
reader = require('./lib/nodejs/fsReader.js');

var fileFormat = require('./lib/proto/fileformat.js');
var blockFormat = require('./lib/proto/osmformat.js');

var BLOB_HEADER_SIZE_SIZE = 4;
var foo = 0;

function readBlobHeaderContent(fd, position, size, callback){
    return reader.readPBFElement(fd, position, size, fileFormat.BlobHeader.decode, callback);
}

function readFileBlock(fd, position, callback){
    reader.readBlobHeaderSize(fd, position, BLOB_HEADER_SIZE_SIZE, function(err, blobHeaderSize){
        if(err){
            return callback(err);
        }

        return readBlobHeaderContent(fd, position + BLOB_HEADER_SIZE_SIZE, blobHeaderSize, function(err, blobHeader){
            if(err){
                return callback(err);
            }

            blobHeader.position = position + BLOB_HEADER_SIZE_SIZE + blobHeaderSize;

            var ret = {
                position: position,
                size: BLOB_HEADER_SIZE_SIZE + blobHeaderSize + blobHeader.datasize,
                blobHeader: blobHeader
            };

            // console.log( foo++ );
            return callback( err, ret );
        });
    });
}

function readFileBlocks(fd, callback){
    reader.getFileSize(fd, function(err, fileSize){
        var position, fileBlocks;

        position = 0;
        fileBlocks = [];

        function readNextFileBlock(){
            readFileBlock(fd, position, function(err, fileBlock){
                if(err){
                    return callback(err);
                }

                fileBlocks.push(fileBlock);

                position = fileBlock.position + fileBlock.size;

                if(position < fileSize){
                    readNextFileBlock();
                }
                else{
                    return callback(null, fileBlocks);
                }
            });
        }

        readNextFileBlock();
    });
}

var stuff = { calls: 0 };

setInterval( console.log.bind( console, stuff ), 500 );

function readBlob(fileBlock, callback){
    return reader.readPBFElement(fd, fileBlock.blobHeader.position, fileBlock.blobHeader.datasize, fileFormat.Blob.decode, callback);
}

function readBlock(fileBlock, callback){
    return readBlob(fileBlock, function(err, blob){
        if(err){
            return callback(err);
        }

        if(blob.raw_size === 0){
            return callback('Uncompressed pbfs are currently not supported.');
        }

        zlib.inflateBlob(blob, function(err, data){
            if(err){
                return callback(err);
            }

            return buf.readPBFElementFromBuffer(data, OSM_BLOB_DECODER_BY_TYPE[fileBlock.blobHeader.type], callback);
        });
    });
}

function createFileParser(fd, callback){
  readFileBlocks(fd, function(err, fileBlocks){
    stuff.calls++;
    fileBlocks.forEach( function( fileblock ){
      var type = fileblock.blobHeader.type;
      if( !stuff[ type ] ) stuff[ type ] = 0;
      stuff[ type ]++;
    });
    console.log( fileBlocks );

    parser.readBlock( parser.fileBlocks[0], function(err, block){
        if(err){
            return fail(err);
        }

        console.log( block );
    });
  });
}

function createPathParser(opts){
    reader.open(opts, function(err, fd){
        createFileParser(fd, function(err, parser){
            if(err){
                return opts.callback(err);
            }

            parser.close = function(callback){
                return reader.close(fd, callback);
            };

            return opts.callback(null, parser);
        });
    });
}

createPathParser({ filePath: '/media/hdd/osm/mapzen-metro/london.osm.pbf' });