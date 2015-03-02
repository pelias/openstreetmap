
module.exports = function( schema, field ){
  if( !field ){ field = 'address'; }
  return function( item, record ){
    if( record.hasMeta('tags') ){
      var tags = record.getMeta('tags');
      for( var tag in schema ){
        var addressProp = schema[ tag ];
        if( tags.hasOwnProperty( tag ) ){
          if( !record[field] ){ record[field] = {}; }
          record[field][ addressProp ] = tags[ tag ];
        }
      }
    }
  };
};