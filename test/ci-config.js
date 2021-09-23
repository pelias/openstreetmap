
var fs = require('fs'),
    path = require('path'),
    settings = require('pelias-config').generate();

settings.imports.openstreetmap.datapath = path.resolve(__dirname);
settings.imports.openstreetmap.import = [
{
  filename: 'vancouver_canada.osm.pbf'
},
{
  filename: 'queens_village_ny.osm.pbf'
}
];

var configPath = process.env.HOME + '/pelias.json';
fs.writeFileSync( configPath, JSON.stringify( settings ) );
