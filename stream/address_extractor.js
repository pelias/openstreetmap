
var through = require('through2');

var inc = 0;

module.exports = function(){

  var stream = through.obj( function( item, enc, done ) {

    // forward item downstream
    this.push( item );

    // create a new record for street addresses
    if( item.hasOwnProperty('address') ){
      if( item.address.hasOwnProperty('number') && item.address.hasOwnProperty('street') ){
        var record = {
          id: 'street-' + item.type + '-' + inc,
          name: {
            default: item.address.number + ' ' + item.address.street,
            street: item.address.street
          },
          type: 'address',
          center_point: item.center_point,
          admin0: item.admin0,
          admin1: item.admin1,
          admin2: item.admin2,
          _meta: item._meta
        };
        this.push( record );
        inc++;
      }
    }

    return done();
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
};