
/*
 * GET message listing => show()
 * POST meaasge posting => send()
 */

var settings = require('../settings');
var group = require('../models/group');
var mesg = require('../models/mesg');
var querystring = require('querystring');
var iolib = require('../socket/io');
var orm = require('orm');

exports.welcome = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    var info = {title: name, name: name, secret: secret};
    var fallback = function(err) {
        req.flash('error', err);
        return res.redirect('/');
    }
    group.checkSecret(name, secret, function(err) {
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
        req.flash('success', 'Save this page to bookmarks for further writing.');
        if (secret)
            return res.redirect('/w/' + name + '/' + secret + '/' + escapeU);
        else
            return res.redirect('/p/' + name + '/' + escapeU);
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
    group.checkSecret(name, secret, function(err) {
        if (err) return fallback(err);
        req.models.mesg.count({group: name}, function(err, count) {
            if (err) return fallback('Database error');
            info.totpage = Math.ceil(count / settings.perpage);
            var skip = settings.perpage * (page - 1);
            req.models.mesg.find({group: name}, { offset: skip },
                settings.perpage, '-id',
                function(err, mesglist) {
                    if (err) fallback(err);
                    info.mesglist = mesg.getNormalizedInfo(mesglist);
                    return res.render('mesglist', info);
                });
        });
    });
};

var saveMessage = function (req, res, cb) {
    var name = req.params.name;
    var secret = req.params.secret;
    var user = req.params.user;
    var escapeU = querystring.escape(user);
    var info = {title: name, name: name, secret: secret, urlu: escapeU, user: user};
    group.checkSecret(name, secret, function(err) {
        if (err) return cb(err);
        if (!req.body.content) return cb("No content");
        req.models.mesg.find({}).order('-id').limit(1).run(function(err, last) {
            var item = req.body;
            item.id = err ? 0 : (last[0] ? last[0].id + 1 : 0);
            item.author = user; item.group = name;
            item.create = new Date();
            req.models.mesg.create([item], function(err, items) {
                if (err) return cb('Database error');
                iolib.io.sockets.in(name).emit('message',
                    { text: item.content, perpage: settings.perpage,
                      mesg: mesg.getNormalizedInfo([item])[0] });
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

exports.getmesg = function(req, res) {
    var name = req.params.name;
    var secret = req.params.secret;
    if (!req.query.last) req.query.last = 0;
    group.checkSecret(name, secret, function(err) {
        if (err) return res.send({err: err, data: []});
        req.models.mesg.find({group: name, id: orm.gt(req.query.last)},
                'id', function(err, mesgs) {
            if (err) return res.send({err: err, data: []});
            else {
                var mesglist = mesg.getRawInfo(mesgs);
                return res.send({err: null, data: mesglist});
            }
        });
    });
};
