
var through = require('through2');
var mongo = require('mongodb');
var async = require('async');


// hacky shit
var server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
db = new mongo.Db('quattroshapes', server);

var collections = {};
var dbopen = false;

// open db
db.open(function(err, db) {
  if( err ){
    console.error( err );
    process.exit(1);
  }
  dbopen = true;
});

function getCollection( collectionName, done ){
  if( collections.hasOwnProperty( collectionName ) ){
    return done( null, collections[collectionName] );
  }

  // @hacky hack to handle shitty mongodb api
  var _open = function(){
    if( dbopen ){
      db.collection(collectionName, function(err, collection) {
        collections[collectionName] = collection;
        done( err, collection );
      });
    } else {
      setTimeout( _open, 100 );
    }
  }
  _open();
}
// end

var loadCollections = function( cb ){
  getCollection( 'admin0', function( err, admin0 ){
    getCollection( 'admin1', function( err, admin1 ){
      getCollection( 'admin2', function( err, admin2 ){
        getCollection( 'local_admin', function( err, local_admin ){
          getCollection( 'locality', function( err, locality ){
            getCollection( 'neighborhood', function( err, neighborhood ){
              cb();
            });
          });
        });
      });
    });
  });
}

var quadtree = require('quadtree');

var query = function( centroid ){
  return {
    "geohash": new RegExp( '^'+quadtree.encode( { lng: centroid.lon, lat: centroid.lat }, 6 ) ),
    "boundaries": {
      "$geoIntersects": {
        "$geometry": {
          "type": "Point",
          "coordinates": [ centroid.lon, centroid.lat ]
        }
      }
    }
  };
}

var stream = through.obj( function( item, enc, done ) {

  loadCollections(function(){

    var queryVal = query( item.center_point );
    console.log( 'queryVal', JSON.stringify( queryVal, null, 2 ) );
    
    async.parallel(
    [
      function(callback) {
        collections['admin0'].findOne( queryVal, callback );
      },
      function(callback) {
        collections['admin1'].findOne( queryVal, callback );
      },
      function(callback) {
        collections['admin2'].findOne( queryVal, callback );
      }
    ], function(err, result) {
      if (err) throw err;
      
      item.admin0 = result[0];
      item.admin1 = result[1];
      item.admin2 = result[2];

      this.push( item, enc );
      done();
    }.bind(this));

  }.bind(this));

});

// catch stream errors
stream.on( 'error', console.error.bind( console, __filename ) );

module.exports = stream;