var xmlParser = require('./xmlParser.js');
var pbfParser = require('./pbfParser.js');
var http = require('http');

function getFileType(filePath){
    return /^.*[.](xml|pbf)$/.exec(filePath)[1];
}

var CALLBACK_PARSER_BY_FILE_TYPE = {
    xml: xmlParser.parse,
    pbf: pbfParser.parse
};

function parse(opts){
    var format;

    if(opts.format){
        format = opts.format;
    }
    else{
        format = getFileType(opts.filePath);
    }

    return CALLBACK_PARSER_BY_FILE_TYPE[format](opts);
}

module.exports = {

    /**
     * Detects the file type from the file name. Possible return values
     * are:
     * - xml: openStreetMap XML format
     * - pbf: openStreetMap PBF format
     */
    getFileType: getFileType,

    parse: parse,

    parseXml: xmlParser.parse,

    parsePbf: xmlParser.parse,

    createPbfParser: pbfParser.createParser

};
