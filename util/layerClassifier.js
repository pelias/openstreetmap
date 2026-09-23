'use strict';

/**
 * Compile a pbf2json pattern string into a predicate for an OSM tags object.
 * Conditions are separated by '+' and all must match (AND logic), each is
 * either 'key' (key must exist) or 'key~value' (key must equal value).
 */
function compilePattern(pattern) {
  const conditions = pattern.split('+').map(condition => {
    const tildeIdx = condition.indexOf('~');
    if (tildeIdx === -1) {
      return tags => Object.prototype.hasOwnProperty.call(tags, condition);
    }
    const key = condition.slice(0, tildeIdx);
    const value = condition.slice(tildeIdx + 1);
    return tags => tags[key] === value;
  });
  return tags => conditions.every(matches => matches(tags));
}

function patternMatchesTags(pattern, tags) {
  return compilePattern(pattern)(tags);
}

// patterns are compiled once per features object, since classify() is called
// for every record of an import
const compiledFeatures = new Map();

function compileFeatures(features) {
  return Object.entries(features)
    .filter(([, config]) => Array.isArray(config.tags))
    .map(([layer, config]) => [layer, config.tags.map(compilePattern)]);
}

/**
 * Classify an OSM tags object against the features config.
 * Iterates layers in declaration order and returns the first matching layer.
 * Falls back to 'venue' if no patterns match.
 *
 * @param {Object} tags     - OSM tags from a pbf2json record
 * @param {Object} features - the features.js keyed-by-layer export
 * @returns {string} layer name
 */
function classify(tags, features) {
  if (!compiledFeatures.has(features)) {
    compiledFeatures.set(features, compileFeatures(features));
  }
  const matchesTags = matches => matches(tags);
  for (const [layer, patterns] of compiledFeatures.get(features)) {
    if (patterns.some(matchesTags)) {
      return layer;
    }
  }
  return 'venue';
}

module.exports = { patternMatchesTags, classify };
