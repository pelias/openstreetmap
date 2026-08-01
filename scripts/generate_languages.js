#!/usr/bin/env node
'use strict';

/**
 * Generates scripts/languages.json: a snapshot of the ISO-639-1 codes we accept
 * as name:<lang> suffixes, mapped to their English language names.
 *
 * The snapshot exists so generate_taginfo.js can run with no node_modules — the
 * npm-publish CI job runs semantic-release without an `npm install`, and both
 * iso-639-3 and config/localized_name_keys (which needs lodash) are unavailable there.
 *
 * Run after upgrading iso-639-3; test/scripts/languages.js fails if it drifts.
 */

const fs      = require('fs');
const path    = require('path');
const iso6393 = require('iso-639-3');

const localizedKeys = require('../config/localized_name_keys');

function build() {
  const names = iso6393.reduce((acc, lang) => {
    if (lang.iso6391) {
      // iso-639-3 qualifies some names, eg 'Occitan (post 1500)', 'Malay (macrolanguage)'
      acc[lang.iso6391] = lang.name.replace(/\s*\(.*\)\s*$/, '');
    }
    return acc;
  }, {});

  return localizedKeys.reduce((acc, code) => {
    acc[code] = names[code] || code;
    return acc;
  }, {});
}

const outPath = path.join(__dirname, 'languages.json');

if (require.main === module) {
  fs.writeFileSync(outPath, JSON.stringify(build(), null, 2) + '\n');
  console.log(`languages.json written (${Object.keys(build()).length} languages)`);
}

module.exports = build;
