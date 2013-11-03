
/**
 * News model library
 */

var db = require('../db');
var md = require('markdown').markdown.toHTML;
var moment = require('moment');
var schema = require('./schema');

module.exports = db.model('Mesg', schema);

module.exports.getNormalizedInfo = function(mesglist, cb) {
    var newlist = [];
    mesglist.forEach(function(item) {
        var newitem = {
            content: md(item.content),
            create: moment(item.create).format("MM/DD HH:mm"),
            author: item.author,
            id: item.id
        }; newlist.push(newitem);
    });
    return newlist;
};
