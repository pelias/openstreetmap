
/**
 default category mapping, openstreetmap features on the left
 correspond to the Pelias taxonomy on the right.

 you can modify this file to suit your specific use-case, or
 alternatively you can inject your own custom taxonomy mapping
 at runtime.

 A special key '*' is used to match any tag value for that key.
 eg. 'aerialway:*' would match 'aerialway:foo' and 'aerialway:bar'.

 Categories are cumulative, so if a document matches on many different
 mappings then it will inherit *all* of those categories.

 @see: http://wiki.openstreetmap.org/wiki/Map_Features
 @see: https://github.com/pelias/pelias/wiki/Taxonomy-v1
**/

var mapping = {

  'aerialway': {
    '*':                        ['transport'],
  },

  'aeroway': {
    '*':                        ['transport','transport:air'],
    'aerodrome':                ['transport','transport:air','transport:air:aerodrome'],
    'international':            ['transport','transport:air','transport:air:airport']
  },

  'amenity': {

    'bbq':                      ['recreation'],
    'dojo':                     ['recreation'],
    'gym':                      ['recreation'],

    'place_of_worship':         ['religion'],

    'arts_centre':              ['education','entertainment'],
    'community_centre':         ['education','entertainment'],
    'social_centre':            ['education','entertainment'],
    'library':                  ['education','entertainment'],
    'planetarium':              ['education','entertainment'],
    'theatre':                  ['education','entertainment'],
    'college':                  ['education'],
    'kindergarten':             ['education'],
    'school':                   ['education'],
    'university':               ['education'],

    'bar':                      ['nightlife'],
    'biergarten':               ['nightlife','food'],
    'cinema':                   ['entertainment','nightlife'],
    'casino':                   ['nightlife'],
    'gambling':                 ['nightlife'],
    'nightclub':                ['nightlife'],
    'pub':                      ['nightlife'],

    'courthouse':               ['government'],
    'embassy':                  ['government'],
    'fire_station':             ['government'],
    'police':                   ['government'],
    'post_office':              ['government'],
    'ranger_station':           ['government','recreation'],
    'register_office':          ['government'],
    'townhall':                 ['government'],

    'coworking_space':          ['professional'],

    'atm':                      ['finance'],
    'bank':                     ['finance','professional'],
    'bureau_de_change':         ['finance','professional'],

    'clinic':                   ['health'],
    'dentist':                  ['health'],
    'doctors':                  ['health'],
    'hospital':                 ['health'],
    'nursing_home':             ['health'],
    'pharmacy':                 ['health'],
    'social_facility':          ['health'],
    'veterinary':               ['professional'],

    'cafe':                     ['food','retail'],
    'fast_food':                ['food','retail'],
    'food_court':               ['food','retail'],
    'ice_cream':                ['food','retail'],
    'marketplace':              ['food','retail'],
    'restaurant':               ['food','retail','nightlife'],

    'bus_station':              ['transport','transport:public','transport:bus'],
    'taxi':                     ['transport','transport:taxi'],

    'car_rental':               ['transport','professional'],
    'car_wash':                 ['professional'],
    'charging_station':         ['transport','professional'],
    'fuel':                     ['transport','professional'],

    'ferry_terminal':           ['transport','transport:sea']
  },

  'building': {
    'hotel':                    ['accomodation'],
    'commercial':               ['professional'],
    'retail':                   ['retail'],

    'chapel':                   ['religion'],
    'church':                   ['religion'],
    'mosque':                   ['religion'],
    'temple':                   ['religion'],
    'synagogue':                ['religion'],
    'shrine':                   ['religion'],

    'civic':                    ['government'],
    'hospital':                 ['health'],
    'school':                   ['education'],
    'stadium':                  ['entertainment'],
    'university':               ['education'],
    'public':                   ['government'],

    'train_station':            ['transport','transport:station'],
    'transportation':           ['transport','transport:station']
  },

  'craft': {
    '*':                        ['professional']
  },

  'emergency': {
    'ambulance_station':        ['health','government']
  },

  'historic': {
    'archaeological_site':      ['education'],
    'monument':                 ['education']
  },

  'leisure': {
    'adult_gaming_centre':      ['nightlife'],
    'amusement_arcade':         ['entertainment'],
    'beach_resort':             ['entertainment','recreation'],
    'bandstand':                ['entertainment'],
    'dance':                    ['nightlife'],

    'dog_park':                 ['recreation'],
    'fishing':                  ['recreation'],
    'garden':                   ['recreation'],
    'golf_course':              ['recreation','entertainment'],
    'ice_rink':                 ['entertainment'],
    'miniature_golf':           ['entertainment'],
    'nature_reserve':           ['recreation'],
    'park':                     ['recreation'],
    'pitch':                    ['recreation','entertainment'],
    'playground':               ['recreation'],
    'sports_centre':            ['recreation','education','entertainment'],
    'stadium':                  ['entertainment'],
    'summer_camp':              ['recreation','education'],
    'swimming_pool':            ['recreation'],
    'track':                    ['recreation'],
    'water_park':               ['entertainment'],

    'hackerspace':              ['education','entertainment'],
  },

  'military': {
    '*':                        ['government'],
  },

  'natural': {
    'wood':                     ['recreation'],
    'water':                    ['recreation'],
    'glacier':                  ['recreation'],
    'beach':                    ['recreation'],
  },

  'office': {
    '*':                        ['professional']
  },

  'public_transport': {
    '*':                        ['transport','transport:public'],
    'station':                  ['transport','transport:station']
  },

  'railway': {
    'light_rail':               ['transport','transport:rail'],
    'subway':                   ['transport','transport:rail'],
    'tram':                     ['transport','transport:rail'],
    'station':                  ['transport','transport:rail','transport:station']
  },

  'shop': {
    '*':                        ['retail'],
    'bakery':                   ['food'],
    'butcher':                  ['food'],
    'cheese':                   ['food'],
    'chocolate':                ['food'],
    'coffee':                   ['food'],
    'deli':                     ['food'],
    'greengrocer':              ['food'],
    'seafood':                  ['food'],
    'supermarket':              ['food'],

    'tailor':                   ['professional'],
    'copyshop':                 ['professional'],
    'dry_cleaning':             ['professional'],

    'chemist':                  ['health'],
    'medical_supply':           ['health'],
    'optician':                 ['health']
  },

  'sport': {
    '*':                        ['recreation'],
    'american_football':        ['entertainment'],
    'australian_football':      ['entertainment'],
    'badminton':                ['entertainment'],
    'baseball':                 ['entertainment'],
    'basketball':               ['entertainment'],
    'beachvolleyball':          ['entertainment'],
    'billiards':                ['entertainment'],
    'canadian_football':        ['entertainment'],
    'chess':                    ['entertainment'],
    'cricket':                  ['entertainment'],
    'dog_racing':               ['entertainment'],
    'field_hockey':             ['entertainment'],
    'gaelic_games':             ['entertainment'],
    'horse_racing':             ['entertainment'],
    'ice_hockey':               ['entertainment'],
    'karting':                  ['entertainment'],
    'rc_car':                   ['entertainment'],
    'rugby_league':             ['entertainment'],
    'rugby_union':              ['entertainment'],
    'safety_training':          ['education']
  },

  'tourism': {
    'hotel':                    ['accomodation'],
    'motel':                    ['accomodation'],
    'alpine_hut':               ['accomodation'],
    'apartment':                ['accomodation'],
    'guest_house':              ['accomodation'],
    'chalet':                   ['accomodation'],
    'caravan_site':             ['accomodation'],
    'camp_site':                ['accomodation'],
    'wilderness_hut':           ['accomodation'],
    'information':              ['government'],
    'attraction':               ['entertainment'],
    'theme_park':               ['entertainment'],
    'viewpoint':                ['recreation'],
    'museum':                   ['education','entertainment'],
    'gallery':                  ['education','entertainment'],
    'zoo':                      ['education','entertainment']
  }

};

module.exports = mapping;