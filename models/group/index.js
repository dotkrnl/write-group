
/**
 * Group model library
 */

module.exports = { };
module.exports.normalize = require('./normalize');

module.exports.checkSecret = function(name, secret, cb) {
    var group = require('../db').db.models.wg_group;
    group.find({name: name}, 1, function(err, found) {
        if (err || !found[0]) return cb('Group not found');
        if (found[0].secret == 'public') return cb();
        if (found[0].secret != secret) return cb('Bad secret');
        return cb();
    });
};
