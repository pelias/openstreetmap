
var async = require('async');

function build( backends, centroid, done ){

  var hierachy = {};
  var opts = {
    type: 'shape-point',
    fields: [ 'name.default' ],
    strict: false
  };

  async.reduce( backends, hierachy, callback.bind( this, centroid, opts ), done );

}

function callback( centroid, opts, memo, backend, cb ){
  backend.adapter.findAdminHeirachy( centroid, opts, function ( error, resp ) {
    if( resp && resp.length && resp[0]['name.default'] ){
      memo[backend.type] = resp[0]['name.default'];
    }
    // @todo: error not being bubbled up!
    // due to async.reduce failing on first error
    cb( undefined, memo );
  });
}

module.exports = build;