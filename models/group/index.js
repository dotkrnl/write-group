
/**
 * Group model library
 */

var db = require('../db');
var schema = require('./schema');

module.exports = db.model('Group', schema);
module.exports.normalize = require('./normalize');

