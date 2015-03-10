
var fs = require('fs'),
    path = require('path'),
    settings = require('pelias-config').generate();

settings.imports.openstreetmap.datapath = path.resolve(__dirname);
settings.imports.openstreetmap.import = [{
  type: { node: 'osmnode', way: 'osmway' },
  filename: 'somes.osm.pbf'
}];

var configPath = process.env.HOME + '/pelias.json';
fs.writeFileSync( configPath, JSON.stringify( settings ) );