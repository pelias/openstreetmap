
var through = require('through2');

module.exports = function( mapping ){

  return through.obj( function( doc, enc, next ){

    // do not categorize addresses
    if( doc.getId().match('address') ){
      return next( null, doc );
    }

    // skip records with no tags
    var tags = doc.getMeta('tags');
    if( !tags ){
      return next( null, doc );
    }

    // iterate over mapping
    for( var key in mapping ){

      // check each mapping key against document tags
      if( tags.hasOwnProperty( key ) ){

        // handle mapping wildcards
        if( mapping[key].hasOwnProperty('*') ){
          addCategories( doc, mapping[key]['*'] );
        }

        // handle regular features
        for( var feature in mapping[key] ){
          if( '*' === feature ){ continue; }
          if( tags[key] === feature ){
            addCategories( doc, mapping[key][feature] );
          }
        }
      }
    }

    return next( null, doc );

  });

};

function addCategories( doc, categories ){
  if( !Array.isArray( categories ) ){
    categories = [categories];
  }
  categories.forEach( function( category ){
    doc.addCategory( category );
  });
}