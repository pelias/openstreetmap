/*
 * The following little overview extends the osm pbf file structure description
 * from http://wiki.openstreetmap.org/wiki/PBF_Format:
 *
 * - [1] file
 *   - [n] file blocks
 *     - [1] blob header
 *     - [1] blob
 */

var protoBuf = require("protobufjs");
var zlib, buf, reader;

// check if running in Browser or Node.js (use self not window because of Web Workers)
if (typeof self !== 'undefined') {
    zlib = require('./browser/zlib.js');
    buf = require('./browser/buffer.js');
    reader = require('./browser/arrayBufferReader.js');
} else {
    zlib = require('./nodejs/zlib.js');
    buf = require('./nodejs/buffer.js');
    reader = require('./nodejs/fsReader.js');
}

var fileFormat = require('./proto/fileformat.js');
var blockFormat = require('./proto/osmformat.js');
var defer = require("./defer");

var BLOB_HEADER_SIZE_SIZE = 4;

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

            return callback(err, {
                position: position,
                size: BLOB_HEADER_SIZE_SIZE + blobHeaderSize + blobHeader.datasize,
                blobHeader: blobHeader
            });
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

function getStringTableEntry(i){
    var s, str;

    // decode StringTable entry only once and cache
    if (i in this.cache) {
        str = this.cache[i];
    } else {
        s = this.s[i];

        // obviously someone is missinterpreting the meanding of 'offset'
        // and 'length'. they should be named 'start' and 'end' instead.
        str = s.readUTF8StringBytes(s.length - s.offset, s.offset).string;
        this.cache[i] = str;
    }

    return str;
}

function extendStringTable(st){
    st.cache = {};
    st.getEntry = getStringTableEntry;
}

function createNodesView(pb, pg){
    var length, tagsList, deltaData;

    if(pg.nodes.length !== 0){
        throw new Error('primitivegroup.nodes.length !== 0 not supported yet');
    }

    length = 0;

    if(pg.dense){
        length = pg.dense.id.length;
    }

    function createTagsList(){
        var tagsList, i, tagsListI, tags, keyId, keysVals, valId, key, val;

        if(!pg.dense){
            return null;
        }

        keysVals = pg.dense.keys_vals;
        tags = {};
        tagsList = [];

        for(i = 0; i < keysVals.length;){
            keyId = keysVals[i++];

            if(keyId === 0){
                tagsList.push(tags);

                tags = {};

                continue;
            }
            
            valId = keysVals[i++];

            key = pb.stringtable.getEntry(keyId);
            val = pb.stringtable.getEntry(valId);

            tags[key] = val;
        }

        return tagsList;
    }

    tagsList = createTagsList();

    function collectDeltaData(){
        var i, id, timestamp, changeset, uid, userIndex, deltaDataList, deltaData, lat, lon;

        if(!pg.dense){
            return null;
        }

        id = 0;
        lat = 0;
        lon = 0;

        if(pg.dense.denseinfo){
            timestamp = 0;
            changeset = 0;
            uid = 0;
            userIndex = 0;
        }

        deltaDataList = [];

        for(i = 0; i < length; ++i){
            // TODO we should test wheather adding 64bit numbers works fine with high values
            id += pg.dense.id[i].toNumber();

            lat += pg.dense.lat[i].toNumber();
            lon += pg.dense.lon[i].toNumber();

            deltaData = {
                id: id,
                lat: lat,
                lon: lon
            };

            if(pg.dense.denseinfo){
                // TODO we should test wheather adding 64bit numbers works fine with high values
                timestamp += pg.dense.denseinfo.timestamp[i].toNumber();
                changeset += pg.dense.denseinfo.changeset[i].toNumber();

                // TODO we should test wheather adding 64bit numbers works fine with high values
                uid += pg.dense.denseinfo.uid[i];

                userIndex += pg.dense.denseinfo.user_sid[i];

                deltaData.timestamp = timestamp * pb.date_granularity;
                deltaData.changeset = changeset;
                deltaData.uid = uid;
                deltaData.userIndex = userIndex;
            }

            deltaDataList.push(deltaData);
        }

        return deltaDataList;
    }

    deltaData = collectDeltaData();

    function get(i){
        var node, nodeDeltaData;

        nodeDeltaData = deltaData[i];

        node = {
            id: '' + nodeDeltaData.id,
            lat: (pb.lat_offset.toNumber() + (pb.granularity * nodeDeltaData.lat)) / 1000000000,
            lon: (pb.lon_offset.toNumber() + (pb.granularity * nodeDeltaData.lon)) / 1000000000,
            tags: tagsList[i]
        };

        if(pg.dense.denseinfo){
            node.version = pg.dense.denseinfo.version[i];
            node.timestamp = nodeDeltaData.timestamp;
            node.changeset = nodeDeltaData.changeset;
            node.uid = '' + nodeDeltaData.uid;
            node.user = pb.stringtable.getEntry(nodeDeltaData.userIndex);
        }

        return node;
    }

    return {
        length: length,
        get: get
    };
}

function createWaysView(pb, pg){
    var length;

    length = pg.ways.length;

    function get(i){
        var way, result, info;

        way = pg.ways[i];

        function createTagsObject(){
            var tags, i, keyI, valI, key, val;

            tags = {};

            for(i = way.keys.length - 1; i >= 0; --i){
                keyI = way.keys[i];
                valI = way.vals[i];

                key = pb.stringtable.getEntry(keyI);
                val = pb.stringtable.getEntry(valI);

                tags[key] = val;
            }

            return tags;
        }

        function createNodeRefIds(){
            var nodeIds, lastRefId, i;

            nodeIds = [];
            lastRefId = 0;

            for(i = 0; i < way.refs.length; ++i){
                // TODO we should test wheather adding 64bit numbers works fine with high values
                lastRefId += way.refs[i].toNumber();

                nodeIds.push('' + lastRefId);
            }

            return nodeIds;
        }

        result = {
            id: way.id.toString(),
            tags: createTagsObject(),
            nodeRefs: createNodeRefIds()
        };

        if (way.info) {
            info = way.info;
            if (info.version) {
                result.version = info.version;
            }
            if (info.timestamp) {
                result.timestamp = info.timestamp.toNumber() * pb.date_granularity;
            }
            if (info.changeset) {
                result.changeset = info.changeset.toNumber();
            }
            if (info.uid) {
                result.uid = '' + info.uid;
            }
            if (info.user_sid) {
                result.user = pb.stringtable.getEntry(info.user_sid);
            }
        }

        return result;
    }

    return {
        length: length,
        get: get
    };
}

function createRelationsView(pb, pg){
    var length;

    length = pg.relations.length;

    function get(i){
        var relation, result, info;

        relation = pg.relations[i];

        function createTagsObject(){
            var tags, i, keyI, valI, key, val;

            tags = {};

            for(i = relation.keys.length - 1; i >= 0; --i){
                keyI = relation.keys[i];
                valI = relation.vals[i];

                key = pb.stringtable.getEntry(keyI);
                val = pb.stringtable.getEntry(valI);

                tags[key] = val;
            }

            return tags;
        }

        function createMembers(){
            var members, memberObj, lastRefId, i, MemberType, type;

            MemberType = blockFormat.Relation.MemberType;
            members = [];
            lastRefId = 0;

            for(i = 0; i < relation.memids.length; ++i){
                memberObj = {};

                // TODO we should test wheather adding 64bit numbers works fine with high values
                lastRefId += relation.memids[i].toNumber();
                memberObj.ref = '' + lastRefId;

                memberObj.role = pb.stringtable.getEntry(relation.roles_sid[i]);

                type = relation.types[i];
                if (MemberType.NODE === type) {
                    memberObj.type = 'node';
                } else if(MemberType.WAY === type) {
                    memberObj.type = 'way';
                } else if(MemberType.RELATION === type) {
                    memberObj.type = 'relation';
                }

                members.push(memberObj);
            }

            return members;
        }

        result = {
            id: relation.id.toString(),
            tags: createTagsObject(),
            members: createMembers()
        };

        if (relation.info) {
            info = relation.info;
            if (info.version) {
                result.version = info.version;
            }
            if (info.timestamp) {
                result.timestamp = info.timestamp.toNumber() * pb.date_granularity;
            }
            if (info.changeset) {
                result.changeset = info.changeset.toNumber();
            }
            if (info.uid) {
                result.uid = '' + info.uid;
            }
            if (info.user_sid) {
                result.user = pb.stringtable.getEntry(info.user_sid);
            }
        }

        return result;
    }

    return {
        length: length,
        get: get
    };
}

function extendPrimitiveGroup(pb, pg){
    pg.nodesView = createNodesView(pb, pg);
    pg.waysView = createWaysView(pb, pg);
    pg.relationsView = createRelationsView(pb, pg);
}

function decodePrimitiveBlock(buffer){
    var data, i;

    data = blockFormat.PrimitiveBlock.decode(buffer);

    // extend stringtable
    extendStringTable(data.stringtable);

    // extend primitivegroup
    for(i = 0; i < data.primitivegroup.length; ++i){
        extendPrimitiveGroup(data, data.primitivegroup[i]);
    }

    return data;
}

var OSM_BLOB_DECODER_BY_TYPE = {
    'OSMHeader': blockFormat.HeaderBlock.decode,
    'OSMData': decodePrimitiveBlock
};

function createFileParser(fd, callback){
    readFileBlocks(fd, function(err, fileBlocks){
        if(err){
            return callback(err);
        }

        function findFileBlocksByBlobType(blobType){
            var blocks, i, block;

            blocks = [];

            for(i = 0; i < fileBlocks.length; ++i){
                block = fileBlocks[i];

                if(block.blobHeader.type !== blobType){
                    continue;
                }

                blocks.push(block);
            }

            return blocks;
        }

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

        return callback(null, {
            fileBlocks: fileBlocks,
            
            findFileBlocksByBlobType: findFileBlocksByBlobType,

            readBlock: readBlock
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

function visitOSMHeaderBlock(block, opts){
    // TODO
    opts.next();
}

function visitPrimitiveGroup(pg, opts){
    var i;
    var total = pg.nodesView.length + pg.waysView.length + pg.relationsView.length;

    opts.next = defer( total, opts.next );

    // visit nodes
    for(i = 0; i < pg.nodesView.length; ++i){
        opts.node(pg.nodesView.get(i), opts.next);
        if( opts.node.length == 1 ){ opts.next(); } // reverse compatibility
    }

    // visit ways
    for(i = 0; i < pg.waysView.length; ++i){
        opts.way(pg.waysView.get(i), opts.next);
        if( opts.way.length == 1 ){ opts.next(); } // reverse compatibility
    }

    // visit relations
    for(i = 0; i < pg.relationsView.length; ++i){
        opts.relation(pg.relationsView.get(i), opts.next);
        if( opts.relation.length == 1 ){ opts.next(); } // reverse compatibility
    }
}

function visitOSMDataBlock(block, opts){
    var i;

    opts.next = defer( block.primitivegroup.length, opts.next );

    for(i = 0; i < block.primitivegroup.length; ++i){
        visitPrimitiveGroup(block.primitivegroup[i], opts);
    }
}

var BLOCK_VISITORS_BY_TYPE = {
    OSMHeader: visitOSMHeaderBlock,
    OSMData: visitOSMDataBlock
};

function visitBlock(fileBlock, block, opts){
    BLOCK_VISITORS_BY_TYPE[fileBlock.blobHeader.type](block, opts);
}

function parse(opts){
    return createPathParser({
        filePath: opts.filePath,
        buffer: opts.buffer,
        callback: function(err, parser){
            var nextFileBlockIndex;

            function fail(err){
                if( parser ){
                    parser.close();
                }

                return opts.error(err);
            }
            
            if(err){
                return fail(err);
            }

            nextFileBlockIndex = 0;

            function visitNextBlock(){
                var fileBlock;

                if(nextFileBlockIndex >= parser.fileBlocks.length){
                    parser.close();

                    opts.endDocument();

                    return;
                }

                fileBlock = parser.fileBlocks[nextFileBlockIndex];

                parser.readBlock(fileBlock, function(err, block){
                    if(err){
                        return fail(err);
                    }

                    opts.next = function(){
                        nextFileBlockIndex += 1;
                        visitNextBlock();
                    }

                    visitBlock(fileBlock, block, opts);
                });
            }

            visitNextBlock();
        }
    });
}

module.exports = {
    parse: parse,

    createParser: createPathParser
};
