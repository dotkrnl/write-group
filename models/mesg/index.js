
/**
 * News model library
 */

var md = require('markdown').markdown.toHTML;
var moment = require('moment');

module.exports = { };

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

module.exports.getRawInfo = function(mesglist, cb) {
    var newlist = [];
    mesglist.forEach(function(item) {
        var newitem = {
            content: item.content,
            create: moment(item.create).format("YYYY/MM/DD HH:mm:ss"),
            author: item.author,
            id: item.id
        }; newlist.push(newitem);
    });
    return newlist;
};
