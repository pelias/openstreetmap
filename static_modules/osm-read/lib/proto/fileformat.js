module.exports = require("protobufjs").newBuilder().import({
    "package": "OSMPBF",
    "messages": [
        {
            "name": "Blob",
            "fields": [
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "raw",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "raw_size",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "zlib_data",
                    "id": 3,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "lzma_data",
                    "id": 4,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "OBSOLETE_bzip2_data",
                    "id": 5,
                    "options": {
                        "deprecated": true
                    }
                }
            ],
            "enums": [],
            "messages": [],
            "options": {}
        },
        {
            "name": "BlobHeader",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "type",
                    "id": 1,
                    "options": {}
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "indexdata",
                    "id": 2,
                    "options": {}
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "datasize",
                    "id": 3,
                    "options": {}
                }
            ],
            "enums": [],
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
