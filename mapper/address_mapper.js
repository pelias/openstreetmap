
module.exports = function( schema, field ){
  if( !field ){ field = 'address'; }
  return function( item, record ){
    if( item.tags ){
      for( var tag in schema ){
        var addressProp = schema[ tag ];
        if( item.tags.hasOwnProperty( tag ) ){
          if( !record[field] ){ record[field] = {}; }
          record[field][ addressProp ] = item.tags[ tag ];
          delete item.tags[ tag ];
        }
      }
    }
  };
};