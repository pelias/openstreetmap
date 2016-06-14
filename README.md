> This repository is part of the [Pelias](https://github.com/pelias/pelias) project. Pelias is an open-source, open-data geocoder built by [Mapzen](https://www.mapzen.com/) that also powers [Mapzen Search](https://mapzen.com/projects/search). Our official user documentation is [here](https://mapzen.com/documentation/search/).

# Pelias OpenStreetMap importer

![Travis CI Status](https://travis-ci.org/pelias/openstreetmap.svg)
[![Gitter Chat](https://badges.gitter.im/pelias/pelias.svg)](https://gitter.im/pelias/pelias?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Overview

| ![osm](http://wiki.openstreetmap.org/w/images/archive/c/c8/20110430164439%21Public-images-osm_logo.png) | The openstreetmap importer provides a way of parsing, mapping and augmenting OSM data in to elasticsearch.         |
| ------------- |:-------------|

## Prerequisites

* NodeJS `0.12` or newer (the latest in the Node 4 series is currently recommended)
* Elasticsearch 1.7 (support for version 2 and above is not here, yet).

## Clone and Install dependencies

Since this module is just one part of our geocoder, we'd recommend starting with our [Vagrant image](https://github.com/pelias/vagrant) for quick setup, or our [full installation docs](https://github.com/pelias/pelias-doc/blob/master/installing.md) to use this module.

```bash
$ git clone https://github.com/pelias/openstreetmap.git && cd openstreetmap;
$ npm install
```

## Download data

In order to build an administrative hierachy for each record, you will need [Who's On First](https://github.com/pelias/whosonfirst) data downloaded and imported into the whosonfirst module. 

The importer will accept any valid `pbf` extract you have, this can be a full planet file (25GB+) from http://planet.openstreetmap.org/ or a smaller extract from https://mapzen.com/metro-extracts/ or http://download.geofabrik.de/

> __PRO-TIP:__ *Currently, this module only supports the input of a single pbf file.*

## Configuration

In order to tell the importer the location of your downloads, temp space and enviromental settings you will first need to create a `~/pelias.json` file.

See [the config](https://github.com/pelias/config) documentation for details on the structure of this file. Your relevant config info for the openstreetmap module might look something like this:

```javascript
    "openstreetmap": {
      "datapath": "/mnt/pelias/openstreetmap",
      "adminLookup": false,
      "leveldbpath": "/tmp",
      "import": [{
        "filename": "planet.osm.pbf"
      }]
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
  the `wof-admin-lookup` README for setup documentation. 
- `imports.adminLookup.url` - this is the endpoint to query for admin hierarchy lookups, currently the code only supports usage of WOF admin lookup module.
- `imports.adminLookup.maxConcurrentReqs` - this is the number of concurrent requests your setup will support to the admin lookup service. The bigger this number, the faster the import process.


## Setting up Elasticsearch Mappings

While `elasticsearch` is technically schema-less, the data will not be correctly stored unless you first tell it how the data is to be indexed.

```bash
$ git clone https://github.com/pelias/schema.git && cd schema;
$ npm install
$ node scripts/create_index.js
```

In order to confirm that the mappings have been correctly inserted in to elasticsearch you can now query http://localhost:9200/pelias/\_mapping

## Running an import

This will start the import process, it will take around 30 seconds to prime it's in-memory data and then you should see regular debugging output in the terminal.

```bash
$ PELIAS_CONFIG=<path_to_config_json> npm start
```

You should now be able to retrieve the OSM data directly from `elasticsearch`:
- http://localhost:9200/pelias/address/\_search
- http://localhost:9200/pelias/venue/\_search

## How long does it take?

Ingestion time varies from machine-to-machine but as a general guide it takes about 7 minutes to import 125,000 points-of-interest & 140,000 street addresses covering the city of London on a quad-core 2.x GHZ machine with an SSD.

These counts are of records containing valid location names to search on, data which is not directly searchable by the end user is not imported.

If you are looking to run a planet-wide cluster like the one we provide at https://search.mapzen.com/ please get in contact for more information from our ops team.

## Querying the data and running a service

Once you're all set up you can clone and install https://github.com/pelias/api which provides a RESTful webserver and the query logic required to control what information gets retrieved from the indeces and how it's formatted for the end user.

To perform a very basic URI search you can execute a query such as:
- http://localhost:9200/pelias/venue/\_search?df=name.default&q=hackney%20city%20farm

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

Travis tests every change against node version `0.10`, `0.12`, `4.x`, and `5.x`.
