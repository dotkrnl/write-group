
/**
 * Group model library
 */

var db = require('../db');
var schema = require('./schema');

module.exports = db.model('Group', schema);
module.exports.normalize = require('./normalize');

module.exports.checkSecret = function(name, secret, cb) {
    module.exports.findOne({name: name}, function(err, found) {
        if (err || !found) return cb('Group not found');
        if (found.secret == 'public') return cb();
        if (found.secret != secret) return cb('Bad secret');
        return cb();
    });
};
