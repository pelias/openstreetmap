/*
 * This file is a wrapper around node-xml. It fixes some issues with
 * node-xml as node-xml (https://github.com/robrighter/node-xml) seems
 * to be abandoned.
 */

var libxml = require('node-xml');

libxml.SaxParser.prototype.parseFile = function(filename) {
    var fs = require('fs');
    var that = this;
    fs.readFile(filename, function (err, data) {
        if(err){
            if(that.m_hndErr.onError){
                that.m_hndErr.onError(err);
            }

            return;
        }

        that.parseString(data);
    });
}

module.exports = {
    SaxParser: libxml.SaxParser
};
