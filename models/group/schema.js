
/**
 * Group model schema
 */

var db = require('../db');
var Schema = db.Schema;

module.exports = new Schema({
    name: {type: String, index: {unique: true}},
    secret: String,
    email: String,
    create: {type: Date, default: Date.now}
});

