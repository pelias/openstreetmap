<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/pelias/design/master/logo/pelias_github/Github_markdown_hero.png">
</p>
<h3 align="center">A modular, open-source search engine for our world.</h3>
<p align="center">Pelias is a geocoder powered completely by open data, available freely to everyone.</p>
<p align="center">
<a href="https://en.wikipedia.org/wiki/MIT_License"><img src="https://img.shields.io/github/license/pelias/api?style=flat&color=orange" /></a>
<a href="https://hub.docker.com/u/pelias"><img src="https://img.shields.io/docker/pulls/pelias/api?style=flat&color=informational" /></a>
<a href="https://gitter.im/pelias/pelias"><img src="https://img.shields.io/gitter/room/pelias/pelias?style=flat&color=yellow" /></a>
</p>
<p align="center">
	<a href="https://github.com/pelias/docker">Local Installation</a> ·
        <a href="https://geocode.earth">Cloud Webservice</a> ·
	<a href="https://github.com/pelias/documentation">Documentation</a> ·
	<a href="https://gitter.im/pelias/pelias">Community Chat</a>
</p>
<details open>
<summary>What is Pelias?</summary>
<br />
Pelias is a search engine for places worldwide, powered by open data. It turns addresses and place names into geographic coordinates, and turns geographic coordinates into places and addresses. With Pelias, you’re able to turn your users’ place searches into actionable geodata and transform your geodata into real places.
<br /><br />
We think open data, open source, and open strategy win over proprietary solutions at any part of the stack and we want to ensure the services we offer are in line with that vision. We believe that an open geocoder improves over the long-term only if the community can incorporate truly representative local knowledge.
</details>

# Pelias OpenStreetMap importer

## Overview

The OpenStreetMap importer handles importing data from [OpenStreetMap](https://www.openstreetmap.org/) into Elasticsearch for use by Pelias.

It includes logic for filtering to select only data relevant for geocoding, transforming it to match the Pelias data model, and augmenting the data as required.

## Prerequisites

See [Pelias software requirements](https://github.com/pelias/documentation/blob/master/requirements.md)

## Clone and Install dependencies

> For instructions on setting up Pelias as a whole, see our [getting started guide](https://github.com/pelias/documentation/blob/master/getting_started_install.md). Further instructions here pertain to the OSM importer only

```bash
$ git clone https://github.com/pelias/openstreetmap.git && cd openstreetmap;
$ npm install
```

## Download data

The importer will accept any valid `pbf` extract you have, such as a full planet file (50GB+) from [planet.openstreetmap.org](https://planet.openstreetmap.org) or [download.geofabrik.de](https://download.geofabrik.de)
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

### Configuration Settings

#### `imports.openstreetmap.datapath`

This is the directory where the OSM importer will look for files to import. If configured it will also download files to this location.

#### `imports.openstreetmap.download[0].sourceURL`

A URL to download when the download script (in `./bin/download`) is run. Will be downloaded to the `datapath` directory.

#### `imports.openstreetmap.import[0].filename`

The OSM importer will look for a file with a name matching this value in the configured `datapath` directory when importing data.

If downloading from a remote URL, the filename must match the value in `sourceURL`.

#### `imports.openstreetmap.leveldbpath`

This is the directory where temporary files will be stored in order to
denormalize OSM ways and relations. In the case of a planet import it is best
to have at least 100GB free.

Defaults to `tmp`.

#### `imports.openstreetmap.importVenues`

By default, the OSM importer imports both venue records and addresses. If set to false, only address records will be imported.

#### `imports.openstreetmap.removeDisusedVenues`

If set to boolean `true`, `venue`s with popularity below `0` (as determined by OSM tags) will be
discarded. In practice, this affects records with tags such as
`[disused](https://wiki.openstreetmap.org/wiki/Key:disused#disused:_namespace)`,
`[amenity:disused](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddisused)` and
`[abandoned](https://wiki.openstreetmap.org/wiki/Key:abandoned:)`

By default, or if set to any other value besides `true`, these records will be imported.

### Administrative Hierarchy Lookup

OSM records often do not contain information about which city, state (or
other region like province), or country that they belong to. Pelias has the
ability to compute these values from [Who's on First](http://www.whosonfirst.org/) data.
For more info on how admin lookup works, see the documentation for
[pelias/wof-admin-lookup](https://github.com/pelias/wof-admin-lookup). By default,
adminLookup is enabled.  To disable, set `imports.adminLookup.enabled` to `false` in Pelias config.

**Note:** Admin lookup requires loading around 5GB of data into memory.

## Running an import

This will start the import process. It may take a few minutes to load administrative data and begin processing the OSM PBF file, then you should see regular progress updates in the terminal.

```bash
$ npm start
```

## How long does it take?

If all goes well, you should see between 6000-7000 records imported per second on a modern machine. A full planet install will import about 80 million records, whereas most city extracts will import at most a few thousand.

These counts are of records containing valid location names to search on, data which is not directly searchable by the end user, such as fire hydrants, lamp posts, etc is not imported.

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
