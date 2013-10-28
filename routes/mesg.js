
/*
 * GET message listing => show()
 * POST meaasge posting => send()
 */

var settings = require('../settings');
var group = require('../models/group');
var mesg = require('../models/mesg');
var md = require('markdown').markdown.toHTML;
var moment = require('moment');
var querystring = require("querystring");

var checkSecret = function(name, secret, cb) {
    group.findOne({name: name}, function(err, found) {
        if (err || !found) return cb('Group not found');
        if (found.secret != secret) return cb('Bad secret');
        return cb();
    });
};

var getMessageInfo = function(mesglist, cb) {
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

var renderMessages = function(condition, skip, limit, res, info, cb) {
    mesg.find(condition).sort('-create').skip(skip).limit(limit)
        .find(function(err, mesglist) {
            if (err) cb(err);
            var latest = mesglist[0] ? mesglist[0].id : 0;
            info.mesglist = getMessageInfo(mesglist);
            res.render('mesgsingles', info, function(err, html) {
                return cb(null, mesglist.length, html, latest);
            });
        });
};

exports.welcome = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    var info = {title: name, name: name, secret: secret};
    var fallback = function(err) {
        req.flash('error', err);
        return res.redirect('/');
    }
    checkSecret(name, secret, function(err) {
        if (err) return fallback(err);
        return res.render('mesgwelcome', info);
    });
};

exports.redirect = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    var user = req.body.user;
    var escapeU = querystring.escape(user);
    if (user == '') {
        req.flash('error', 'Name needed');
        return res.redirect('back');
    } else {
        req.flash('error', 'Save this page to bookmarks for further writing.');
        return res.redirect('/w/' + name + '/' + secret + '/' + user);
    }
};

exports.show = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    var user = req.params.user;
    var escapeU = querystring.escape(user);
    var info = {title: name, name: name, secret: secret, urlu: escapeU, user: user};
    var page = info.page = Number(req.params.page || '1');
    var fallback = function(err) {
        console.log(err);
        req.flash('error', err);
        return res.redirect('/');
    }
    checkSecret(name, secret, function(err) {
        if (err) return fallback(err);
        mesg.find({group: name}).count(function(err, count) {
            if (err) return fallback('Database error');
            info.totpage = Math.ceil(count / settings.perpage);
            var skip = settings.perpage * (page - 1);

            renderMessages({group: name}, skip, settings.perpage, res, info, function(err, count, html, latest) {
                if (err) fallback(err);
                info.latest = page == 1 ? latest : -1;
                info.mesgsingles = html;
                return res.render('mesglist', info);
            });
        });
    });
};

saveMessage = function (req, res, cb) {
    var name = req.params.name;
    var secret = req.params.secret;
    var user = req.params.user;
    var escapeU = querystring.escape(user);
    var info = {title: name, name: name, secret: secret, urlu: escapeU, user: user};
    checkSecret(name, secret, function(err) {
        if (err) return cb(err);
        if (!req.body.content) return cb("No content");
        mesg.findOne().sort('-id').exec(function(err, last) {
            var item = new mesg(req.body);
            item.id = last ? last.id + 1 : 0;
            item.author = user; item.group = name;
            item.save(function(err) {
                if (err) return cb('Database error');
                return cb();
            });
        });
    });
};

exports.send = function(req, res) {
    var fallback = function(err) {
        console.log(err);
        req.flash('error', err);
        return res.redirect('back');
    };
    saveMessage(req, res, function(err) {
        if (err) return fallback(err);
        else return res.redirect('back');
    });
};

exports.sendmesg = function(req, res) {
    var fallback = function(err) {
        console.log(err);
        return res.send({err: err});
    };
    saveMessage(req, res, function(err) {
        if (err) return fallback(err);
        else return res.send({err: null});
    });
};

exports.pullmesg = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    var user = req.params.user;
    var escapeU = querystring.escape(user);
    var info = {title: name, name: name, secret: secret, urlu: escapeU, user: user};
    if (!req.query.latest) return res.send({count: 0});
    var reqid = Number(req.query.latest);
    checkSecret(name, secret, function(err) {
        if (err) return res.send({err: err, count: 0});
        renderMessages({group: name, id: {$gt: reqid}}, 0, settings.perpage, res, info, function(err, count, html, latest) {
            return res.send({err: err, count: count, html: html, latest: count ? latest : reqid, request: reqid});
        });
    });
}
