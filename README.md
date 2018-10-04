>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

# Pelias OpenStreetMap importer

## Overview

The OpenStreetMap importer handles importing data from [OpenStreetMap](https://www.openstreetmap.org/) into Elasticsearch for use by Pelias.

It includes logic for filtering to select only data relevant for geocoding, transforming it to match the Pelias data model, and augmenting the data as required.

## Prerequisites

* NodeJS `6.0.0` or newer (the latest in the Node 8 series is currently recommended)
* Elasticsearch 2.3+ (support for version 1.x has been deprecated).

## Clone and Install dependencies

> For instructions on setting up Pelias as a whole, see our [getting started guide](https://github.com/pelias/documentation/blob/master/getting_started_install.md). Further instructions here pertain to the OSM importer only

```bash
$ git clone https://github.com/pelias/openstreetmap.git && cd openstreetmap;
$ npm install
```

## Download data

The importer will accept any valid `pbf` extract you have, such as a full planet file (39GB+) from [planet.openstreetmap.org](https://planet.openstreetmap.org) or [download.geofabrik.de](https://download.geofabrik.de)
You can use the included download script to obtain the desired `pbf` files as follows. In the configuration file you can
specify which files are to be downloaded. They will all be downloaded to the `imports.openstreetmap.datapath` directory.

If no download sources are specified in the configuration, the entire planet file will be downloaded. Keep in mind this file is quite large.

```bash
$ PELIAS_CONFIG=<path-to-config> npm run download
```

## Configuration

In order to tell the importer the location of your downloads, temp space and environmental settings you will first need to create a `~/pelias.json` file.

See [the config](https://github.com/pelias/config) documentation for details on the structure of this file. Your relevant config info for the openstreetmap module might look something like this:

```javascript
{
  "imports": {
    "openstreetmap": {
      "download": [{
        "sourceURL": "https://s3.amazonaws.com/metro-extracts.nextzen.org/portland_oregon.osm.pbf"
      }],
      "datapath": "/mnt/pelias/openstreetmap",
      "leveldbpath": "/tmp",
      "import": [{
        "filename": "portland_oregon.osm.pbf"
      }]
    }
  }
}
```

### Environment Settings

- `imports.openstreetmap.datapath` - this is the directory which you downloaded the pbf file to
- `imports.openstreetmap.download[0].sourceURL` - this is the source URL of the pbf file to be downloaded
- `imports.openstreetmap.import[0].filename` - this is the name of the pbf file you downloaded
- `imports.openstreetmap.leveldbpath` - this is the directory where temporary files will be stored in order to denormalize osm ways, in the case of a planet import it is best to have 100GB free so you don't run out of disk.

> __PRO-TIP:__ If your paths point to an SSD rather than a HDD then you will get a significant speed boost, although this is not required.


### Administrative Hierarchy Lookup

OSM records often do not contain information about which city, state (or
other region like province), or country that they belong to. Pelias has the
ability to compute these values from [Who's on First](http://www.whosonfirst.org/) data.
For more info on how admin lookup works, see the documentation for
[pelias/wof-admin-lookup](https://github.com/pelias/wof-admin-lookup). By default,
adminLookup is enabled.  To disable, set `imports.adminLookup.enabled` to `false` in Pelias config.

**Note:** Admin lookup requires loading around 5GB of data into memory.

## Running an import

This will start the import process, it will take around 30 seconds to prime it's in-memory data and then you should see regular debugging output in the terminal.

```bash
$ PELIAS_CONFIG=<path_to_config_json> npm start
```

## How long does it take?

Ingestion time varies from machine-to-machine but as a general guide it takes about 7 minutes to import 125,000 points-of-interest & 140,000 street addresses covering the city of London on a quad-core 2.x GHZ machine with an SSD.

These counts are of records containing valid location names to search on, data which is not directly searchable by the end user is not imported.

If you are looking to run a planet-wide cluster like the one we provide for [geocode.earth](https://geocode.earth) please see our documentation on [full planet builds](https://github.com/pelias/documentation/blob/master/full_planet_considerations.md#importer-machine).

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

Travis tests every change against all supported Node.js versions.

![Travis CI Status](https://travis-ci.org/pelias/openstreetmap.svg)


### Versioning

We rely on semantic-release and Greenkeeper to maintain our module and dependency versions.

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/openstreetmap.svg)](https://greenkeeper.io/)
