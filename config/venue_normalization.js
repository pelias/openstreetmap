
/**
  expansion and normalization of venue names to allow for consistent searching and more effective synonym use
**/

var mapping = {
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
  }
};

module.exports = mapping;
