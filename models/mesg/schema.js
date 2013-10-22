
/**
 * News model schema
 */

var db = require('../db');
var Schema = db.Schema;

module.exports = new Schema({
    author: String,
    content: String,
    create: {type: Date, default: Date.now, index: true},
    group: {type: String, index: true},
    id: {type: Number, index: {unique: true}},
});
