
/**
  Utility script to scrape tag information from taginfo
**/

var taginfo = require('taginfo'),
    extend = require('extend'),
    async = require('async');

var q = {
  query: 'name:',
  sortname: 'count_all',
  sortorder: 'desc',
  page: 1,
  rp: 500,
  format: 'json'
};

function request( page ){
  return function(done){
    taginfo.keys.all(
      done.bind(null, null),
      extend( false, {}, q, { page: page } )
    );
  };
}

// 5 pages of 500 results
var requests = [
  request(1),
  request(2),
  request(3),
  request(4),
  request(5)
];

async.parallel( requests, function( err, res ){
  if( err ){ throw new Error( err ); }

  // reduce tags
  var tags = [];
  res.forEach(function( r ){
    tags = tags.concat( r.data.filter( function( cur ){
      return cur.in_wiki; // only 'official' name tags
    }).map( function( i ){
      return i.key;
    }));
  });

  // print out (if need be this can be changed to the logger)
  console.log( JSON.stringify( tags, null, 2 ) );
});
