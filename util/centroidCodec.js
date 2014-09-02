
// -- simple codec

module.exports.encodeSimple = function( centroid ){
  return centroid.lat + ':' + centroid.lon;
};

module.exports.decodeSimple = function( value ){
  var parts = (value || ':').split(':');
  return {
    lat: Number( parts[0] ),
    lon: Number( parts[1] )
  };
};

// -- base64 codec
// note: not smaller than a simple concat

module.exports.encodeBase64 = function( centroid ){
  return new Buffer(centroid.lat + ':' + centroid.lon, 'ascii').toString('base64');
};

module.exports.decodeBase64 = function( value ){
  var parts = new Buffer(value || 'Og==', 'base64').toString('ascii').split(':');
  return {
    lat: Number( parts[0] ),
    lon: Number( parts[1] )
  };
};


module.exports.encode = module.exports.encodeSimple;
module.exports.decode = module.exports.decodeSimple;