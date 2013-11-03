
/*
 * GET show new group form => showNew
 * POST do new group => doNew
 */

var settings = require('../settings');
var group = require('../models/group');

exports.showNew = function(req, res) {
    return res.render('newgroup', {form: {}, title:'--new-group'});
};

var mksecret = function() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

exports.doNew = function (req, res) {
    res.locals.message.error = res.locals.message.error || [];
    group.normalize.normalizeAll(req.body,
        function(newinfo, errors) {
            newinfo.type = req.body.type;
            var fallback = function(errors) {
                errors.forEach(function(err) {
                    res.locals.message.error.push(err);
                });
                return res.render('newgroup', {form: newinfo, title:'--new-group'});
            };
            if (errors) return fallback(errors);
            if (req.body.type == 'public') newinfo.secret = 'public';
            else newinfo.secret = mksecret();
            var item = new group(newinfo);
            item.save(function(err) {
                if (err) return fallback(['Group name used']);
                if (req.body.type != 'public')
                    return res.redirect('/w/' + newinfo.name + '/' + newinfo.secret);
                else
                    return res.redirect('/p/' + newinfo.name);
            });
        });
}

