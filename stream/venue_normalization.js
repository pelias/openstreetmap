
/**
  The venue normalization is similar to the category mapper
  It's designed to add standardized aliases for different venue types to allow easier searching'
**/

var through = require('through2');
var peliasLogger = require( 'pelias-logger' ).get( 'openstreetmap' );

module.exports = function( mapping ){

  return through.obj( function( doc, enc, next ){

    try {

      // do not normalize addresses
      if( doc.getType().match('address') ){
        return next( null, doc );
      }

      // skip records with no tags
      var tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }
      
      var name = doc.getName( 'default' );
      if ( !name ) {
	name = doc.getNameAliases( 'default' );
      }
      if ( !name || name.legnth === 0 ){
        return next( null, doc );
      }
      
      // iterate over mapping
      for( var key in mapping ){

        // check each mapping key against document tags
        if( !tags.hasOwnProperty( key ) ){ continue; }

        // handle regular features
        for( var feature in mapping[key] ){
          if( tags[key] === feature ){
	    var rule = mapping[key][feature];
	    addAliases( name, rule, doc );
          }
	}
      }
    }

    catch( e ){
      peliasLogger.error( 'venue normalization error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
    }

    return next( null, doc );

  });

};

function addAliases( name, rule, doc ) {
  if( rule.hasOwnProperty( 'alt_suffixes' ) ){
    for( var suffix in rule.alt_suffixes ){
      var suffix_name = rule.alt_suffixes[suffix];
      if( name.toLowerCase().endsWith( ' ' + suffix_name ) ){
	name = name.slice( 0, -suffix_name.length - 1 );
      }
    }
  }
  
  if( rule.hasOwnProperty( 'suffix' ) && name.length > 0 ){
    doc.setNameAlias( 'default', name + ' ' + rule.suffix );
  }
}
