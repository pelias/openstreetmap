
module.exports = function( schema ){
  return function( item, record ){
    if( item.tags ){
      for( var tag in schema ){
        var addressProp = schema[ tag ];
        if( item.tags.hasOwnProperty( tag ) ){
          if( !record.address ){ record.address = {}; }
          record.address[ addressProp ] = item.tags[ tag ];
          delete item.tags[ tag ];
        }
      }
    }
  }
};