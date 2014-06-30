module.exports = require("protobufjs").newBuilder().import({
    "package": "OSMPBF",
    "messages": [
        {
            "name": "HeaderBlock",
            "fields": [
                {
                    "rule": "optional",
                    "type": "HeaderBBox",
                    "name": "bbox",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "required_features",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "optional_features",
                    "id": 5,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "writingprogram",
                    "id": 16,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 17,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "osmosis_replication_timestamp",
                    "id": 32,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "osmosis_replication_sequence_number",
                    "id": 33,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "osmosis_replication_base_url",
                    "id": 34,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "HeaderBBox",
            "fields": [
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "left",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "right",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "top",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "bottom",
                    "id": 4,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "PrimitiveBlock",
            "fields": [
                {
                    "rule": "required",
                    "type": "StringTable",
                    "name": "stringtable",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "PrimitiveGroup",
                    "name": "primitivegroup",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "granularity",
                    "id": 17,
                    "options": {
                        "default": 100
                    }
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lat_offset",
                    "id": 19,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lon_offset",
                    "id": 20,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "date_granularity",
                    "id": 18,
                    "options": {
                        "default": 1000
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "PrimitiveGroup",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "Node",
                    "name": "nodes",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "DenseNodes",
                    "name": "dense",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "Way",
                    "name": "ways",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "Relation",
                    "name": "relations",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "ChangeSet",
                    "name": "changesets",
                    "id": 5,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "StringTable",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "bytes",
                    "name": "s",
                    "id": 1,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Info",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "version",
                    "id": 1,
                    "options": {
                        "default": -1
                    }
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "timestamp",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "changeset",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "uid",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "uint32",
                    "name": "user_sid",
                    "id": 5,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bool",
                    "name": "visible",
                    "id": 6,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "DenseInfo",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "version",
                    "id": 1,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "timestamp",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "changeset",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint32",
                    "name": "uid",
                    "id": 4,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint32",
                    "name": "user_sid",
                    "id": 5,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "bool",
                    "name": "visible",
                    "id": 6,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "ChangeSet",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Node",
            "fields": [
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "keys",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "vals",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "Info",
                    "name": "info",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "lat",
                    "id": 8,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "sint64",
                    "name": "lon",
                    "id": 9,
                    "options": {}
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "DenseNodes",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "id",
                    "id": 1,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "DenseInfo",
                    "name": "denseinfo",
                    "id": 5,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "lat",
                    "id": 8,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "lon",
                    "id": 9,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "keys_vals",
                    "id": 10,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Way",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "keys",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "vals",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "Info",
                    "name": "info",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "refs",
                    "id": 8,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "Relation",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "id",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "keys",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "uint32",
                    "name": "vals",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "optional",
                    "type": "Info",
                    "name": "info",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "roles_sid",
                    "id": 8,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "memids",
                    "id": 9,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "MemberType",
                    "name": "types",
                    "id": 10,
                    "options": {
                        "packed": true
                    }
                }
            ],
            "enums": [
                {
                    "name": "MemberType",
                    "values": [
                        {
                            "name": "NODE",
                            "id": 0
                        },
                        {
                            "name": "WAY",
                            "id": 1
                        },
                        {
                            "name": "RELATION",
                            "id": 2
                        }
                    ],
                    "options": {}
                }
            ],
            "messages": [],
            "options": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {
        "optimize_for": "LITE_RUNTIME",
        "java_package": "org.openstreetmap.osmosis.osmbinary"
    },
    "services": []
}).build("OSMPBF");
