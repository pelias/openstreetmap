
/**
 default list of localized name keys to extract from osm tags
 eg. 'en' means that the tag 'name:en' is extracted.

 keys not present in this list should not be extracted
 (note: they may be extracted by another function)

 this file is nessesary due to the free-tagging nature of
 osm. @see ./test/fixtures for an example list of tags
 contained in the planet file (sourced from taginfo)

 some common keys we need to defend against:
 'name:ဗမာ', 'name:<阪神電鉄>', 'name:*'
**/

var keys = [
  'en',
  'ru',
  'ja',
  'de',
  'fr',
  'ar',
  'fi',
  'uk',
  'be',
  'ko',
  'sv',
  'prefix',
  'it',
  'es',
  'el',
  'nl',
  'ga',
  'kn',
  'ca',
  'pl',
  'cs',
  'pt',
  'cy',
  'full',
  'no',
  'sl',
  'gd',
  'nn',
  'etymology'
];

module.exports = keys;