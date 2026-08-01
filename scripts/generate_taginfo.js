#!/usr/bin/env node
'use strict';

/**
 * Generates taginfo.json describing which OSM tags Pelias reads.
 *
 * Sources of truth pulled in at generation time:
 *   - config/features.js          (venue detection tags, address filter keys)
 *   - config/addendum_whitelist.js (metadata tags stored in the OSM addendum)
 *   - schema/name_osm.js           (name/alias tags)
 *   - scripts/languages.json      (name:<lang> codes, snapshot of localized_name_keys)
 *   - schema/address_*.js          (address tags)
 *
 * Published to npm and served by jsDelivr:
 *   https://cdn.jsdelivr.net/npm/pelias-openstreetmap/taginfo.json
 */

// note: this script runs during `npm publish` in a checkout with no node_modules,
// so it must only require core modules and local files (see scripts/languages.json)
const fs   = require('fs');
const path = require('path');

const pkg          = require('../package.json');
const features     = require('../config/features');
const nameSchema   = require('../schema/name_osm');
const karlsruhe    = require('../schema/address_karlsruhe');
const osmAddr      = require('../schema/address_osm');
const tiger        = require('../schema/address_tiger');
const naptan       = require('../schema/address_naptan');
const addendumKeys = require('../config/addendum_whitelist');
const languages    = require('./languages.json');

const OBJECT_TYPES = ['node', 'way', 'relation'];

function entry(key, description, value) {
  const e = { key };
  if (value !== undefined) {
    e.value = value;
  }
  e.object_types = OBJECT_TYPES;
  e.description  = description;
  return e;
}

// ---------------------------------------------------------------------------
// Venue detection tags — derived from config/features.js
// Format: 'amenity+name', 'railway~station+name', 'highway~pedestrian+area~yes+name'
// '+' = AND conditions; '~' = key=value; 'name' and 'area~yes' are secondary filters
// ---------------------------------------------------------------------------
function parseVenueTags(patterns) {
  const seen    = new Set();
  const entries = [];
  for (const pattern of patterns) {
    const parts = pattern.split('+').filter(p => p !== 'name' && p !== 'area~yes');
    for (const part of parts) {
      const [key, value] = part.split('~');
      const id = value ? `${key}=${value}` : key;
      if (!seen.has(id)) {
        seen.add(id);
        entries.push({ key, value });
      }
    }
  }
  return entries;
}

const venueTags = parseVenueTags(features.layers.venue.tags).map(({ key, value }) => {
  const desc = value ?
    `${key}=${value} features with a name are imported as venues` :
    `Features with any ${key} tag and a name are imported as venues`;
  return entry(key, desc, value);
});

// ---------------------------------------------------------------------------
// Address tags — derived from all address schemas + features.addressTags
// ---------------------------------------------------------------------------
const addressDescriptions = {
  'addr:housenumber': 'House number; required (with addr:street or addr:place) to create an address record',
  'addr:street':      'Street name for address records',
  'addr:place':       'Named settlement used instead of a street for rural addresses',
  'addr:housename':   'Building or house name, imported as the address name',
  'addr:postcode':    'Postal/ZIP code',
  'postal_code':      'Postal code (OSM standard key, alternative to addr:postcode)',
  'tiger:zip_left':   'US TIGER-imported postal code for the left side of the street',
  'tiger:zip_right':  'US TIGER-imported postal code for the right side of the street',
  'naptan:Street':    'Street name from the UK NaPTAN bus stop dataset',
};

const addressKeys = new Set([
  ...Object.keys(karlsruhe),
  ...Object.keys(osmAddr),
  ...Object.keys(tiger),
  ...Object.keys(naptan),
  // pbf2json filter patterns like 'addr:housenumber+addr:street'
  ...features.addressTags.flatMap(p => p.split('+')),
]);

const addressTags = [...addressKeys].map(k =>
  entry(k, addressDescriptions[k] || 'Address field used by the Pelias OSM importer')
);

// ---------------------------------------------------------------------------
// Name tags — derived from schema/name_osm.js
// Localized name tags (name:en, name:fr, …) come from scripts/languages.json
// ---------------------------------------------------------------------------
const nameDescriptions = {
  name:       'Primary display name; the main search term for a record',
  loc_name:   'Local name; indexed as an alias',
  alt_name:   'Alternative name; indexed as an alias',
  short_name: 'Short name; indexed as an alias',
};

// taginfo has no wildcard syntax — 'name:*' would be read as a literal asterisk —
// so every localized key we accept is listed individually. scripts/languages.json is
// a snapshot of config/localized_name_keys; a unit test fails if the two diverge.
const localizedNameTags = Object.keys(languages).map(code =>
  entry(`name:${code}`, `Name in ${languages[code]}, indexed as a localized alias`)
);

const nameTags = [
  ...Object.keys(nameSchema).map(k =>
    entry(k, nameDescriptions[k] || 'Name variant indexed as an alias')
  ),
  ...localizedNameTags,
];

// ---------------------------------------------------------------------------
// Addendum / metadata tags — derived from config/addendum_whitelist.js
// ---------------------------------------------------------------------------
const addendumTags = addendumKeys.map(k =>
  entry(k, `${k} is stored verbatim in the OSM addendum of every imported record`)
);

// ---------------------------------------------------------------------------
// Assemble, deduplicate (venue tags take precedence), and write
// ---------------------------------------------------------------------------
const seen = new Set();
const tags = [...venueTags, ...addressTags, ...nameTags, ...addendumTags].filter(t => {
  const id = t.value !== undefined ? `${t.key}=${t.value}` : t.key;
  if (seen.has(id)) {
    return false;
  }
  seen.add(id);
  return true;
});

const output = {
  data_format: 1,
  data_url: `https://cdn.jsdelivr.net/npm/${pkg.name}/taginfo.json`,
  project: {
    name:          'Pelias Geocoder — OpenStreetMap importer',
    description:   'Imports OpenStreetMap data into the Pelias geocoding engine',
    project_url:   'https://pelias.io',
    doc_url:       `${pkg.homepage}#readme`,
    icon_url:      'https://github.com/pelias.png',
    contact_name:  'Pelias Team',
    contact_email: 'team@pelias.io',
  },
  tags,
};

const outPath = path.join(__dirname, '..', 'taginfo.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`taginfo.json written (${tags.length} tag entries)`);
