/**
  The popularity mapper is responsible for generating a 'popularity'
  value by inspecting OSM tags.

  Disused and abandoned places are given a strong negative score.
  If the popularity score is less than zero then the document is discarded.

  Feel free to make changes to this mapping file!
**/

const _ = require('lodash');
const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');
const peliasConfig = require('pelias-config').generate();
const mapping = require('../config/popularity_map');

module.exports = function(){

  return through.obj(( doc, enc, next ) => {

    try {

      // only map venues
      if( !['venue', 'address'].includes(doc.getLayer()) ){
        return next(null, doc);
      }

      // skip records with no tags
      let tags = doc.getMeta('tags');
      if( !tags ){
        return next( null, doc );
      }

      // default popularity
      let popularity = doc.getPopularity() || 0;

      // apply scores from config
      _.each(mapping, (osmTagScores, osmTagKey) => {
        if( tags.hasOwnProperty( osmTagKey ) ){
          // global score for the tag
          if( osmTagScores._score ){
            popularity += osmTagScores._score;
          }
          // individual scores for specific values
          _.each(osmTagScores, (osmSubTagScores, osmTagValue) => {
            if( osmTagValue === '_score' ){ return; }
            if( !osmSubTagScores._score ){ return; }
            if (_.get(tags, osmTagKey, '').trim().toLowerCase() === osmTagValue ){
              popularity += osmSubTagScores._score;
            }
          });
        }
      });

      // addresses with a popularity score GTE 10000 receieve
      // a popularity of 1000, all others get a popularity of 0.
      if ( doc.getLayer() === 'address' ){
        popularity = (popularity >= 10000) ? 1000 : 0;
      }

      // set document popularity if it is greater than zero
      if( popularity > 0 ){ doc.setPopularity( popularity ); }

      // discard places with a negative popularity
      else if( popularity < 0 && peliasConfig.get('imports.openstreetmap.removeDisusedVenues') === true ){
        peliasLogger.warn(`removing record ${doc.getGid()} (${doc.getName('default')}) with popularity ${popularity}`);
        return next();
      }
    }

    catch( e ){
      peliasLogger.error( 'popularity_mapper error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
    }

    return next( null, doc );
  });

};
