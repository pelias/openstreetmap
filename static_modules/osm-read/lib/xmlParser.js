var libxml = require('./libxml');
var http = require('http');

function parseNOP(s){
    return s;
}

function parseIntDecimal(s){
    return parseInt(s, 10);
}

function parseBool(s){
    return (s === 'true');
}

var nodeAttrParser = {
    id: parseNOP,
    lat: parseFloat,
    lon: parseFloat,
    version: parseIntDecimal,
    changeset: parseIntDecimal,
    user: parseNOP,
    uid: parseNOP,
    visible: parseBool
};

var wayAttrParser = {
    id: parseNOP,
    version: parseIntDecimal,
    changeset: parseIntDecimal,
    user: parseNOP,
    uid: parseNOP,
    visible: parseBool
};

var relationAttrParser = {
    id: parseNOP,
    version: parseIntDecimal,
    changeset: parseIntDecimal,
    user: parseNOP,
    uid: parseNOP,
    visible: parseBool
};

function parseAttributes(entity, attrParsers, attrs){
    var i, attr, key, value, attrParser;

    for(i = 0; i < attrs.length; ++i){
        attr = attrs[i];

        key = attr[0];

        attrParser = attrParsers[key];
        if(attrParser === undefined){
            continue;
        }

        value = attr[1];

        entity[key] = attrParser(value);
    }
}

function parse(opts){
    var parser, elementParser, elementEndParser, node, way, tags, relations, wayNodeRefs;

    node = null;
    way = null;
    tags = null;
    relations = null;
    wayNodeRefs = null;

    elementParser = {};
    elementEndParser = {};

    function ensureTagsParser(){
        if(elementParser.tag){
            return;
        }

        elementParser.tag = function(elem, attrs, prefix, uri, namespaces){
            var tag, i, attr, key, value;

            if(tags === null){
                return;
            }

            tagKey = null;
            tagValue = null;

            for(i = 0; i < attrs.length; ++i){
                attr = attrs[i];

                key = attr[0];

                if(key === 'k'){
                    tagKey = attr[1];
                }
                else if(key === 'v'){
                    tagValue = attr[1];
                }
            }

            tags[tagKey] = tagValue;
        };
    }

    if(opts.bounds){
        elementParser.bounds = function(elem, attrs, prefix, uri, namespaces){
            var bounds, i, attr, key, value;

            bounds = {};

            for(i = 0; i < attrs.length; ++i){
                attr = attrs[i];

                key = attr[0];
                value = attr[1];

                bounds[key] = parseFloat(value);
            }

            return opts.bounds(bounds);
        };
    }

    if(opts.node){
        elementParser.node = function(elem, attrs, prefix, uri, namespaces){
            tags = {};

            node = {
                tags: tags
            };

            parseAttributes(node, nodeAttrParser, attrs);
        };

        elementEndParser.node = function(elem, prefix, uri){
            var n;

            n = node;
            node = null;
            tags = null;

            return opts.node(n);
        };

        ensureTagsParser();
    }

    if(opts.way){
        elementParser.way = function(elem, attrs, prefix, uri, namespaces){
            tags = {};
            wayNodeRefs = [];

            way = {
                tags: tags,
                nodeRefs: wayNodeRefs
            };

            parseAttributes(way, wayAttrParser, attrs);
        };

        elementEndParser.way = function(elem, prefix, uri){
            var w;

            w = way;
            way = null;
            tags = null;
            wayNodeRefs = null;

            return opts.way(w);
        };

        elementParser.nd = function(elem, attrs, prefix, uri, namespaces){
            var i, attr;

            for(i = 0; i < attrs.length; ++i){
                attr = attrs[i];

                if(attr[0] === 'ref'){
                    wayNodeRefs.push(attr[1]);

                    break;
                }
            }
        };

        ensureTagsParser();
    }

    if(opts.relation){
        elementParser.relation = function(elem, attrs, prefix, uri, namespaces){
            tags = {};

            relation = {
                tags: tags,
                members: []
            };

            parseAttributes(relation, relationAttrParser, attrs);
        };

        elementEndParser.relation = function(elem, prefix, uri){
            var r;

            r = relation;
            relation = null;
            tags = null;

            return opts.relation(r);
        };

        elementParser.member = function(elem, attrs, prefix, uri, namespaces){
            var i, attr, attrKey, attrValue, memberObj;

            memberObj = {}

            for(i = 0; i < attrs.length; ++i){
                attr = attrs[i];

                attrKey = attr[0];
                attrValue = attr[1];

                memberObj[attrKey] = attrValue;
            }

            relation.members.push(memberObj);
        };

        ensureTagsParser();
    }

    parser = new libxml.SaxParser(function(cb){
        if(opts.endDocument){
            cb.onEndDocument(opts.endDocument);
        }

        cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces){
            if(elem in elementParser){
                elementParser[elem](elem, attrs, prefix, uri, namespaces);
            }
        });

        cb.onEndElementNS(function(elem, prefix, uri){
            if(elem in elementEndParser){
                elementEndParser[elem](elem, prefix, uri);
            }
        });

        if(opts.error){
            cb.onError(opts.error);
        }
    });

    if(opts.filePath){
        return parser.parseFile(opts.filePath);
    }

    if(opts.url){
        return http.get(opts.url, function(res){
            var responseBody;

            if(res.statusCode !== 200){
                if(opts.error){
                    opts.error(new Error('Server returned http status code ' + res.statusCode));
                }

                return;
            }

            responseBody = '';

            res.on('data', function(chunk){
                responseBody += chunk;
            });

            res.on('end', function(){
                parser.parseString(responseBody);
            });
        }).on('error', function(e){
            if(opts.error){
                opts.error(e);
            }
        });
    }

    if(opts.error){
        opts.error(new Error('Missing data source'));
    }
}

module.exports = {
    parse: parse
};
