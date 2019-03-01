
/**
  expansion and normalization of venue names to allow for consistent searching and more effective synonym use
**/

var mapping = {
  'railway': {
    'station': {
      'alt_suffixes': ['station'],
      'suffix': 'Railway Station',
    }
  }
};

module.exports = mapping;
