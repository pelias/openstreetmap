> This repository is part of the [Pelias](https://github.com/pelias/pelias) project. Pelias is an open-source, open-data geocoder built by [Mapzen](https://www.mapzen.com/) that also powers [Mapzen Search](https://mapzen.com/projects/search). Our official user documentation is [here](https://mapzen.com/documentation/search/).

# Pelias OpenStreetMap importer

![Travis CI Status](https://travis-ci.org/pelias/openstreetmap.svg)
[![Gitter Chat](https://badges.gitter.im/pelias/pelias.svg)](https://gitter.im/pelias/pelias?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Overview

| ![osm](http://wiki.openstreetmap.org/w/images/archive/c/c8/20110430164439%21Public-images-osm_logo.png) | The openstreetmap importer provides a way of parsing, mapping and augmenting OSM data in to elasticsearch.         |
| ------------- |:-------------|

## Prerequisites

* NodeJS `4.0.0` or newer (the latest in the Node 4 series is currently recommended)
* Elasticsearch 2.3+ (support for version 1.x has been deprecated).

## Clone and Install dependencies

Since this module is just one part of our geocoder, we'd recommend starting with our [Vagrant image](https://github.com/pelias/vagrant) for quick setup, or our [full installation docs](https://github.com/pelias/pelias-doc/blob/master/installing.md) to use this module.

```bash
$ git clone https://github.com/pelias/openstreetmap.git && cd openstreetmap;
$ npm install
```

## Download data

The importer will accept any valid `pbf` extract you have, this can be a full planet file (25GB+) from http://planet.openstreetmap.org/ or a smaller extract from https://mapzen.com/metro-extracts/ or http://download.geofabrik.de/

> __PRO-TIP:__ *Currently, this module only supports the input of a [single pbf file at a time, but we wish to support multiple files](https://github.com/pelias/openstreetmap/issues/55).*

## Configuration

In order to tell the importer the location of your downloads, temp space and environmental settings you will first need to create a `~/pelias.json` file.

See [the config](https://github.com/pelias/config) documentation for details on the structure of this file. Your relevant config info for the openstreetmap module might look something like this:

```javascript
    "openstreetmap": {
      "datapath": "/mnt/pelias/openstreetmap",
      "adminLookup": false,
      "leveldbpath": "/tmp",
      "import": [{
        "filename": "london_england.osm.pbf"
      }]
    }
```

### Environment Settings

- `imports.openstreetmap.datapath` - this is the directory which you downloaded the pbf file to
- `imports.openstreetmap.import[0].filename` - this is the name of the pbf file you downloaded
- `imports.openstreetmap.leveldbpath` - this is the directory where temporary files will be stored in order to denormalize osm ways, in the case of a planet import it is best to have 100GB free so you don't run out of disk.

> __PRO-TIP:__ If your paths point to an SSD rather than a HDD then you will get a significant speed boost, although this is not required.


### Administrative Hierarchy Lookup

Most OSM data doesn't have a full administrative hierarchy (ie, country, state,
county, etc. names), but it can be calculated using data from [Who's on
First](http://whosonfirst.mapzen.com/). See the [readme](https://github.com/pelias/wof-admin-lookup/blob/master/README.md)
for [pelias/wof-admin-lookup](https://github.com/pelias/wof-admin-lookup) for more information.

Set the `imports.openstreetmap.adminLookup` property in `pelias.json` to true to enable admin lookup.

## Running an import

This will start the import process, it will take around 30 seconds to prime it's in-memory data and then you should see regular debugging output in the terminal.

```bash
$ PELIAS_CONFIG=<path_to_config_json> npm start
```

## How long does it take?

Ingestion time varies from machine-to-machine but as a general guide it takes about 7 minutes to import 125,000 points-of-interest & 140,000 street addresses covering the city of London on a quad-core 2.x GHZ machine with an SSD.

These counts are of records containing valid location names to search on, data which is not directly searchable by the end user is not imported.

If you are looking to run a planet-wide cluster like the one we provide at https://search.mapzen.com/ please get in contact for more information from our ops team.

## Issues

If you have any issues getting set up or the documentation is missing something, please open an issue here: https://github.com/pelias/openstreetmap/issues

## Contributing

Please fork and pull request against upstream master on a feature branch.

Pretty please; provide unit tests and script fixtures in the `test` directory.

## Code Linting

A `.jshintrc` file is provided which contains a linting config, usually your text editor will understand this config and give you inline hints on code style and readability.

These settings are strictly enforced when you do a `git commit`, you can execute `git commit` at any time to run the linter against your code.

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

Travis tests every change against Node.js version `4` and `6`.
