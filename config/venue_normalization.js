
/**
  expansion and normalization of venue names to allow for consistent searching and more effective synonym use
**/

var mapping = [
    {
        'conditions': [
            ['railway', 'station']
        ],
        'synonyms': [
            'station'
        ],
        'suffix': 'railway station'
    },
    {
        'conditions': [
            ['public_transport', 'station'],
            ['station', 'light_rail']
        ],
        'synonyms': [
            'light rail'
        ],
        'suffix': 'light rail station'
    },
    {
        'conditions': [
            ['public_transport', 'stop_position'],
            ['ferry', 'yes']
        ],
        'synonyms': [
            'ferry',
            'wharf',
        ],
        'suffix': 'ferry terminal'
    },
    {
        'conditions': [
            ['amenity', 'parking']
        ],
        'synonyms': [
            'garage',
            'car park',
            'parking',
        ],
        'suffix': 'car park'
    }
];

/*{
  'railway': {
    'station': {
      'alt_suffixes': ['station'],
      'suffix': 'Railway Station',
    }
  },
  'station': {
    'light_rail': {
      'alt_suffixes': ['station', 'light rail'],
      'suffix': 'light rail station',
    }
  },
  'public_transport': {
      
  }
};*/

module.exports = mapping;
