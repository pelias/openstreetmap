
| ![osm](http://wiki.openstreetmap.org/w/images/archive/c/c8/20110430164439%21Public-images-osm_logo.png) | The openstreetmap importer provides a way of parsing, mapping and augmenting OSM data in to elasticsearch.         |
| ------------- |:-------------|

## Prerequisites

In order to use the importer you must first install and configure `elasticsearch` and `nodejs`.

You can follow the instructions here: https://github.com/pelias/pelias/blob/master/INSTALL.md to get set up.

The recommended version for nodejs is `0.12+` and elasticsearch is `1.3.4+` although we also test against `nodejs@0.10`.

Before continuing you should confirm that you have these tools correctly installed and elasticsearch is running on port `9200`.

## Clone and Install dependencies

```bash
$ git clone https://github.com/pelias/openstreetmap.git && cd openstreetmap;
$ npm install
```

## Download data

You will need to download quattroshapes in order to build an admin hierarchy for each record, you can pull-down a tarball from [here](http://quattroshapes.mapzen.com/quattroshapes/quattroshapes-simplified.tar.gz) (537MB) which you will need to extract, preferably to an SSD if you have one.

The importer will accept any valid `pbf` extract you have, this can be a full planet file (25GB+) from http://planet.openstreetmap.org/ or a smaller extract from https://mapzen.com/metro-extracts/ or http://download.geofabrik.de/

## Configuration

In order to tell the importer the location of your downloads, temp space and enviromental settings you will first need to create a `~/pelias.json` file.

As a minimum, it should be valid json and contain the following:

```javascript
{
  "logger": {
    "level": "debug"
  },
  "esclient": {
    "hosts": [{
      "env": "development",
      "protocol": "http",
      "host": "localhost",
      "port": 9200
    }]
  },
  "imports": {
    "openstreetmap": {
      "adminLookup": false,
      "leveldbpath": "/tmp",
      "datapath": "/data/pbf",
      "import": [{
        "filename": "london_england.osm.pbf"
      }]
    }
  }
}
```

### Environment Settings

- `imports.openstreetmap.datapath` - this is the directory which you downloaded the pbf file to
- `imports.openstreetmap.import[0].filename` - this is the name of the pbf file you downloaded
- `imports.openstreetmap.leveldbpath` - this is the directory where temporary files will be stored in order to denormalize osm ways, in the case of a planet import it is best to have 100GB free so you don't run out of disk.

> __PRO-TIP:__ If your paths point to an SSD rather than a HDD then you will get a significant speed boost, although this is not required.


### Administrative Hierarchy Lookup

- `import.openstreetmap.adminLookup` - most OSM data doesn't have a full administrative hierarchy (ie, country, state,
  county, etc. names), but you can optionally create it via the
  [`pelias/wof-admin-lookup`](https://github.com/pelias/wof-admin-lookup) module; just set this property to `true`.  Consult
  the `wof-admin-lookup` README for setup documentation. You'll need a WOF point-in-polygon service running to query against.
- `imports.adminLookup.url` - this is the endpoint to query for admin hierarchy lookups, currently the code only supports usage of WOF admin lookup module.
- `imports.adminLookup.maxConcurrentReqs` - this is the number of concurrent requests your setup will support to the admin lookup service. The bigger this number, the faster the import process.


## Setting up Elasticsearch Mappings

While `elasticsearch` is technically schema-less, the data will not be correctly stored unless you first tell it how the data is to be indexed.

```bash
$ git clone https://github.com/pelias/schema.git && cd schema;
$ npm install
$ node scripts/create_index.js
```

In order to confirm that the mappings have been correctly inserted in to elasticsearch you can now query http://localhost:9200/pelias/_mapping

## Running an import

This will start the import process, it will take around 30 seconds to prime it's in-memory data and then you should see regular debugging output in the terminal.

```bash
$ PELIAS_CONFIG=<path_to_config_json> npm start
```

You should now be able to retrieve the OSM data directly from `elasticsearch`:
- http://localhost:9200/pelias/address/_search
- http://localhost:9200/pelias/venue/_search

## How long does it take?

Ingestion time varies from machine-to-machine but as a general guide it takes about 7 minutes to import 125,000 points-of-interest & 140,000 street addresses covering the city of London on a quad-core 2.x GHZ machine with an SSD.

These counts are of records containing valid location names to search on, data which is not directly searchable by the end user is not imported.

If you are looking to run a planet-wide cluster like the one we provide at https://pelias.mapzen.com/ please get in contact for more information from our ops team.

## Querying the data and running a service

Once you're all set up you can clone and install https://github.com/pelias/api which provides a RESTful webserver and the query logic required to control what information gets retrieved from the indeces and how it's formatted for the end user.

To perform a very basic URI search you can execute a query such as:
- http://localhost:9200/pelias/venue/_search?df=name.default&q=hackney%20city%20farm

## More open data sets

- https://github.com/pelias/geonames
- https://github.com/pelias/openaddresses
- https://github.com/pelias/whosonfirst

## Issues

If you have any issues getting set up or the documentation is missing something, please open an issue here: https://github.com/pelias/openstreetmap/issues

## Contributing

Please fork and pull request against upstream master on a feature branch.

Pretty please; provide unit tests and script fixtures in the `test` directory.

## Code Linting

A `.jshintrc` file is provided which contains a linting config, usually your text editor will understand this config and give you inline hints on code style and readability.

These settings are strictly inforced when you do a `git commit`, you can execute `git commit` at any time to run the linter against your code.

### Running Unit Tests

```bash
$ npm test
```

### Running End-to-End Tests

These tests run the entire pipeline against a small PBF extract to assert that the individual units work as expected when wired together.

```bash
$ npm run end-to-end
```

## Code Coverage

```bash
$ npm run coverage
```

### Continuous Integration

Travis tests every release against node version `0.10` & `0.12`.

[![Build Status](https://travis-ci.org/pelias/openstreetmap.png?branch=master)](https://travis-ci.org/pelias/openstreetmap)
