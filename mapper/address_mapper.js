
module.exports = function( schema, field ){
  if( !field ){ field = 'address'; }
  return function( doc ){
    if( doc.hasMeta('tags') ){
      var tags = doc.getMeta('tags');
      for( var tag in schema ){
        var addressProp = schema[ tag ];
        if( tags.hasOwnProperty( tag ) ){
          doc[field][ addressProp ] = tags[ tag ];
        }
      }
    }
  };
};