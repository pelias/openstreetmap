
var Document = require('pelias-model').Document;
var docs = {};

docs.named = new Document('item1',1);
docs.named.setName('default','poi1');

docs.unnamed = new Document('item2',2); // no name

docs.unnamedWithAddress = new Document('item3',3);
docs.unnamedWithAddress.setCentroid({lat:3,lon:3});
docs.unnamedWithAddress.address = {
  number: '10', street: 'Mapzen pl'
};

docs.namedWithAddress = new Document('item4',4);
docs.namedWithAddress.setName('default','poi4');
docs.namedWithAddress.setCentroid({lat:4,lon:4});
docs.namedWithAddress.address = {
  number: '11', street: 'Sesame st'
};

docs.invalidId = new Document('item5',5);
docs.invalidId._meta.id = undefined; // unset the id
docs.invalidId.setCentroid({lat:5,lon:5});
docs.invalidId.address = {
  number: '12', street: 'Old st'
};

docs.completeDoc = new Document('item6',6);
docs.completeDoc.address = {
  number: '13', street: 'Goldsmiths row', test: 'prop'
};
docs.completeDoc
  .setName('default','item6')
  .setName('alt','item six')
  .setCentroid({lat:6,lon:6})
  .setAlpha3('FOO')
  .setAdmin('admin0','country')
  .setAdmin('admin1','state')
  .setAdmin('admin1_abbr','STA')
  .setAdmin('admin2','city')
  .setAdmin('local_admin','borough')
  .setAdmin('locality','town')
  .setAdmin('neighborhood','hood')
  .setMeta('foo','bar')
  .setMeta('bing','bang');

docs.osmNode1 = new Document('item7',7)
  .setName('osmnode','node7')
  .setCentroid({lat:7,lon:7});

docs.osmWay1 = new Document('osmway',8)
  .setName('osmway','way8')
  .setMeta('nodes', [
    { lat: 10, lon: 10 },
    { lat: 06, lon: 10 },
    { lat: 06, lon: 06 },
    { lat: 10, lon: 06 }
  ]);

docs.osmRelation1 = new Document('item9',9)
  .setName('osmrelation','relation9')
  .setCentroid({lat:9,lon:9});

// ref: https://github.com/pelias/openstreetmap/issues/21
docs.semicolonStreetNumbers = new Document('item10',10);
docs.semicolonStreetNumbers.setName('default','poi10');
docs.semicolonStreetNumbers.setCentroid({lat:10,lon:10});
docs.semicolonStreetNumbers.address = {
  number: '1; 2 ;3', street: 'Pennine Road'
};

// has no 'nodes' and a preset centroid
docs.osmWay2 = new Document('osmway',11)
  .setName('osmway','way11')
  .setCentroid({lat:11,lon:11});

module.exports = docs;