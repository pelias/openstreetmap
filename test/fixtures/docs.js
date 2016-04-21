
var Document = require('pelias-model').Document;
var docs = {};

docs.named = new Document('osm','venue', 'item:1');
docs.named.setName('default','poi1');

docs.unnamed = new Document('osm', 'venue', 'item:2'); // no name

docs.unnamedWithAddress = new Document('osm', 'address', 'item:3');
docs.unnamedWithAddress.setCentroid({lat:3,lon:3});
docs.unnamedWithAddress.address_parts = {
  number: '10', street: 'Mapzen pl'
};

docs.namedWithAddress = new Document('osm','address', 'item:4');
docs.namedWithAddress.setName('default','poi4');
docs.namedWithAddress.setCentroid({lat:4,lon:4});
docs.namedWithAddress.address_parts = {
  number: '11', street: 'Sesame st'
};

docs.completeDoc = new Document('osm','venue','item:6');
docs.completeDoc.address_parts = {
  number: '13', street: 'Goldsmiths row', test: 'prop'
};
docs.completeDoc
  .setName('default','item6')
  .setName('alt','item six')
  .setCentroid({lat:6,lon:6})
  .setMeta('foo','bar')
  .setMeta('bing','bang');

docs.osmNode1 = new Document('osm','venue','item:7')
  .setName('node','node7')
  .setCentroid({lat:7,lon:7});

docs.osmWay1 = new Document('osm','venue','way:8')
  .setName('way','way8')
  .setMeta('nodes', [
    { lat: 10, lon: 10 },
    { lat: 06, lon: 10 },
    { lat: 06, lon: 06 },
    { lat: 10, lon: 06 }
  ]);

docs.osmRelation1 = new Document('osm','venue','item:9')
  .setName('relation','relation9')
  .setCentroid({lat:9,lon:9});

// ref: https://github.com/pelias/openstreetmap/issues/21
docs.semicolonStreetNumbers = new Document('osm','venue','item:10');
docs.semicolonStreetNumbers.setName('default','poi10');
docs.semicolonStreetNumbers.setCentroid({lat:10,lon:10});
docs.semicolonStreetNumbers.address_parts = {
  number: '1; 2 ;3', street: 'Pennine Road'
};

// has no 'nodes' and a preset centroid
docs.osmWay2 = new Document('osm','venue', 'way:11')
  .setName('osmway','way11')
  .setCentroid({lat:11,lon:11});

module.exports = docs;