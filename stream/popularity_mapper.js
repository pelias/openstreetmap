/**
  The popularity mapper is responsible for generating a 'popularity'
  value by inspecting OSM tags.

  Disused and abandoned places are given a strong negative score.
  If the popularity score is less than zero then the document is discarded.

  Feel free to make changes to this mapping file!
**/

const through = require('through2');
const peliasLogger = require('pelias-logger').get('openstreetmap');

const config = {
  // https://taginfo.openstreetmap.org/keys/importance
  importance: {
    international: { _score: 50000 },
    national: { _score: 10000 },
    regional: { _score: 5000 },
    urban: { _score: 1000 },
    suburban: { _score: 500 },
    local: { _score: 100 },
  },

  // concordances
  wikipedia: { _score: 3000 },
  wikidata: { _score: 3000 },

  // properties found on major landmarks &
  // public buildings.
  architect: { _score: 5000 },
  heritage: { _score: 5000 },
  'heritage:operator': { _score: 2000 },
  historic: {
    building: { _score: 5000 },
    church: { _score: 5000 },
    heritage: { _score: 7000 },
    _score: 1000,
  },
  building: {
    colour: { _score: 2000 },
    material: { _score: 2000 },
    supermarket: { _score: 2000 },
    civic: { _score: 2000 },
    government: { _score: 2000 },
    hospital: { _score: 2000 },
    train_station: { _score: 5000 },
    transportation: { _score: 2000 },
    university: { _score: 2000 },
    public: { _score: 2000 },
    sports_hall: { _score: 2000 },
    historic: { _score: 5000 },
  },
  height: { _score: 2000 },
  start_date: { _score: 2000 },
  opening_date: { _score: 2000 },

  // properties found on tourist attractions
  tourism: {
    visitors: { _score: 2000 },
    aquarium: { _score: 2000 },
    attraction: { _score: 1000 },
    museum: { _score: 2000 },
    theme_park: { _score: 2000 },
    zoo: { _score: 2000 },
    _score: 1000
  },
  museum: { _score: 2000 },
  museum_type: { _score: 2000 },
  opening_hours: { _score: 1000 },
  operator: { _score: 1000 },
  fee: { _score: 2000 },

  // closed and abandoned places
  // https://wiki.openstreetmap.org/wiki/Key:disused:
  disused: { _score: -100000 },
  'disused:shop': { _score: -100000 },
  'disused:amenity': { _score: -100000 },
  'disused:railway': { _score: -100000 },
  'disused:leisure': { _score: -100000 },
  // https://wiki.openstreetmap.org/wiki/Key:abandoned:
  abandoned: { _score: -100000 },
  'abandoned:shop': { _score: -100000 },
  'abandoned:amenity': { _score: -100000 },
  'abandoned:railway': { _score: -100000 },
  'abandoned:leisure': { _score: -100000 },

  // types of public amenities
  amenity: {
    disused: { _score: -100000 },
    college: { _score: 2000 },
    library: { _score: 2000 },
    school: { _score: 1000 },
    university: { _score: 2000 },
    bank: { _score: 1000 },
    clinic: { _score: 1000 },
    dentist: { _score: 1000 },
    doctors: { _score: 1000 },
    hospital: { _score: 2000 },
    nursing_home: { _score: 1000 },
    pharmacy: { _score: 1000 },
    social_facility: { _score: 1000 },
    veterinary: { _score: 1000 },
    community_centre: { _score: 1000 },
    music_venue: { _score: 1000 },
    nightclub: { _score: 1000 },
    planetarium: { _score: 1000 },
    social_centre: { _score: 1000 },
    theatre: { _score: 1000 },
    courthouse: { _score: 1000 },
    coworking_space: { _score: 1000 },
    dojo: { _score: 1000 },
    embassy: { _score: 1000 },
    ferry_terminal: { _score: 2000 },
    fire_station: { _score: 1000 },
    marketplace: { _score: 1000 },
    place_of_worship: { _score: 1000 },
    police: { _score: 1000 },
    post_office: { _score: 1000 },
    prison: { _score: 1000 },
    public_bath: { _score: 1000 },
    townhall: { _score: 1000 }
  },

  // transportation
  aerodrome: {
    international: { _score: 10000 },
    regional: { _score: 5000 }
  },
  iata: {
    _score: 5000,
    none: { _score: -5000 }
  },
  railway: {
    station: { _score: 2000 },
    subway_entrance: { _score: 2000 },
  },
  public_transport: {
    station: { _score: 2000 }
    // no scoring boost for `public_transport:*`, as many unimportant records have other tags
  },

  // contact information
  website: { _score: 200 },
  phone: { _score: 200 },
  'contact:website': { _score: 200 },
  'contact:email': { _score: 200 },
  'contact:phone': { _score: 200 },
  'contact:fax': { _score: 200 },

  // social media
  'contact:foursquare': { _score: 200 },
  'contact:facebook': { _score: 200 },
  'contact:linkedin': { _score: 200 },
  'contact:instagram': { _score: 200 },
  'contact:skype': { _score: 200 },
  'contact:flickr': { _score: 200 },
  'contact:youtube': { _score: 200 },
};

module.exports = function(){

  return through.obj(( doc, enc, next ) => {

    try {

      // only map venues
      if( doc.getLayer() !== 'venue' ){
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
      for( let tag in config ){
        if( tags.hasOwnProperty( tag ) ){
          // global score for the tag
          if( config[tag]._score ){
            popularity += config[tag]._score;
          }
          // individual scores for specific values
          for( let value in config[tag] ){
            if( value === '_score' ){ continue; }
            if( !config[tag][value]._score ){ continue; }
            if (tags[tag].trim().toLowerCase() === value ){
              popularity += config[tag][value]._score;
            }
          }
        }
      }

      // set document popularity if it is greater than zero
      if( popularity > 0 ){ doc.setPopularity( popularity ); }

      // discard places with a negative popularity
      else if( popularity < 0 ){ return next(); }
    }

    catch( e ){
      peliasLogger.error( 'popularity_mapper error' );
      peliasLogger.error( e.stack );
      peliasLogger.error( JSON.stringify( doc, null, 2 ) );
    }

    return next( null, doc );
  });

};
