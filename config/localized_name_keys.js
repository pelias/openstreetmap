
/**
 list of iso-639-1 language codes to extract from osm tags

 this file is nessesary due to the free-tagging nature of
 osm. @see ./test/fixtures for an example list of tags
 contained in the planet file (sourced from taginfo)

 some common keys we need to defend against:
 'name:ဗမာ', 'name:<阪神電鉄>', 'name:*'

 Here is an example of the usage.
 All these tags might appear on the same element:

  name=Irgendwas        (the default name, used locally)
  name:en=Something     (the name in English)
  name:el=Κάτι          (the name in Greek)
  name:de=Irgendwas     (the name in German)
  name:pl=Coś           (the name in Polish)
  name:fr=Quelque chose (the name in French)
  name:es=Algo          (the name in Spanish)
  name:it=Qualcosa      (the name in Italian)
  name:ja=何か          (the name in Japanese)
  name:ko=뭔가           (the name in Korean)
  name:ko_rm=Mweonga    (the name in Romanised Korean)

  @note: 'ko_rm' is present in the osm database but not supported
  by pelias due to it not being listed in the ISO specification.

  @see: http://wiki.openstreetmap.org/wiki/Talk:Names
**/

const _ = require('lodash');
const iso6393 = require('iso-639-3');
const keys = [];

_.each(iso6393, (lang) => {
  let code = _.get(lang, 'iso6391');
  if( code ){
    keys.push( code );
  }
});

module.exports = keys;
