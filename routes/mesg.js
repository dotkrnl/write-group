
/*
 * GET message listing => show()
 * POST meaasge posting => send()
 */

var settings = require('../settings');
var group = require('../models/group');
var mesg = require('../models/mesg');
var md = require('markdown').markdown.toHTML;
var moment = require('moment');

var checkSecret = function(name, secret, cb) {
    group.findOne({name: name}, function(err, found) {
        if (err || !found) return cb('Group not found');
        if (found.secret != secret) return cb('Bad secret');
        return cb();
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
    if (user == '') {
        req.flash('error', 'Fullname needed');
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
    var info = {title: name, name: name, secret: secret, user: user};
    var page = info.page = Number(req.params.page || '1');
    var fallback = function(err) {
        req.flash('error', err);
        return res.redirect('/');
    }
    checkSecret(name, secret, function(err) {
        if (err) return fallback(err);
        mesg.find({group: name}).count(function(err, count) {
            if (err) {
                console.log(err);
                return fallback('Database error');
            }
            info.totpage = Math.ceil(count / settings.perpage);
            var skip = settings.perpage * (page - 1);
            mesg.find({group: name}).sort('-create').skip(skip).limit(settings.perpage)
                .find(function(err, mesglist){
                    var newlist = []
                    if (page == 1)
                        info.timestamp = mesglist[0] ?
                            Number(mesglist[0].create) : 0;
                    else info.timestamp = Number(Date.now());
                    mesglist.forEach(function(item) {
                        var newitem = {
                            content: md(item.content),
                            create: moment(item.create).format("MM/DD HH:mm"),
                            author: item.author
                        };
                        newlist.push(newitem);
                    });
                    info.mesglist = newlist;
                    return res.render('mesglist', info);
                });
        });
    });
};

exports.send = function (req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    var user = req.params.user;
    var info = {title: name, name: name, secret: secret, user: user};
    var fallback = function(err) {
        req.flash('error', err);
        return res.redirect('back');
    }
    checkSecret(name, secret, function(err) {
        if (err) return fallback(err);
        if (!req.body.content) return res.render('mesgtextarea', info);
        mesg.findOne().sort('-id').exec(function(err, last) {
            var item = new mesg(req.body);
            item.id = last ? last.id + 1 : 0;
            item.author = user;
            item.group = name;
            item.save(function(err) {
                if (err) {
                    console.log(err);
                    fallback('Unknown error');
                }
                return res.redirect('back');
            });
        });
    });
};

exports.notification = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    if (!req.query.timestamp) return res.send('0');
    checkSecret(name, secret, function(err) {
        if (err) return res.send('0');
        mesg.findOne({group: name}).sort('-create').exec(function(err, last) {
            if (!last) return res.send('0');
            if (err || Number(last.create) <= Number(req.query.timestamp)) return res.send('0');
            else return res.send('1');
        });
    });
}
