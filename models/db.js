
/**
 * Database mongoose.
 */

var dbI = require('../settings').databaseInfo
module.exports = require('orm').express(dbI, {
    define: function (db, models) {
        module.exports.db = db;
        models.mesg = db.define('wg_mesg', require('./mesg/schema'));
        models.group = db.define('wg_group', require('./group/schema'));
        db.sync();
    }
});
