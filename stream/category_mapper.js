
/**
  The category mapper is responsible for checking each documents tags
  against a predefined taxonomy mapping file.

  For each openstreetmap 'feature' that matches the mapping file we
  create a new document 'category' by calling `doc.addCategory( category );`.

  This idea is to classify places-of-interest in order to facilitate the
  building of industry and interest specific geocoders.

  @see: https://github.com/pelias/pelias/wiki/Taxonomy-v1
  @see: ./config/category_map.js
**/

const _ = require('lodash');
const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');

module.exports = function( mapping ){

  return through.obj( function( doc, enc, next ){

    try {

      // do not categorize addresses
      if( doc.getLayer().match('address') ){
        return next( null, doc );
      }

      // skip records with no tags
      var tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }

      // iterate over mapping
      _.each(mapping, (osmTagValues, osmTagKey) => {

        // check each mapping key against document tags
        if( !tags.hasOwnProperty( osmTagKey ) ){ return; }

        // handle mapping wildcards
        if( osmTagValues.hasOwnProperty('*') ){
          addCategories( doc, osmTagValues['*'] );
        }

        // handle regular features
        _.each(osmTagValues, (categories, osmTagValue) => {
          if( '*' === osmTagValue ){ return; }
          if( tags[osmTagKey] === osmTagValue ){
            addCategories( doc, categories );
          }
        });
      });
    }

    catch( e ){
      peliasLogger.error( 'category_mapper error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
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
