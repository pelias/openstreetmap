
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
      for( var idx in mapping ){
        var process = true;
        var rule = mapping[idx];
        
        loop_conditions:
        for( var condition in rule.conditions ) {
          var cond = rule.conditions[condition];
            
          if( !tags.hasOwnProperty( cond[0] ) ) {
            process = false;
            break loop_conditions;
          }
            
          if ( cond.length === 2 && cond[1] !== tags[ cond[0] ] )
          {
            process = false;
            break loop_conditions;
          }
        }
        
        if (!process) {
          continue;
        }
        
        var current_name = name;
        
        if( rule.hasOwnProperty( 'synonyms' ) ) {
          for( var synonym_idx in rule.synonyms ) {
            var synonym = rule.synonyms[synonym_idx];
            if( current_name.toLowerCase().endsWith( ' ' + synonym ) ) {
              current_name = current_name.slice( 0, -synonym.length - 1 );
            }
          }
        }
        
        if( rule.hasOwnProperty( 'suffix' ) && current_name.length > 0 ){
          doc.setNameAlias( 'default', current_name + ' ' + rule.suffix );
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
