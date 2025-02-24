const _ = require('lodash');

// Split multi-value OSM tags into an Array
// https://wiki.openstreetmap.org/wiki/Talk:Semi-colon_value_separator
function parseSemicolonDelimitedValues(value) {
  return (_.isString(value) ? value : '')
    .split(';')
    // Historical Landmark: former site of The Most Clever Line of JavaScript
    // https://blog.bloomca.me/2017/11/08/the-most-clever-line-of-javascript.html
    .map(v => v.trim())
    .filter(v => v.length);
}

module.exports = parseSemicolonDelimitedValues;
