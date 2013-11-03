
/**
 * App routes.
 */

var homepage = require('./homepage');
var group = require('./group');
var mesg = require('./mesg');
var test = require('./test');

module.exports = function(app) {
    app.get('/', homepage.index);

    app.get('/new', group.showNew);
    app.post('/new', group.doNew);

    app.get('/w/:name/:secret', mesg.welcome);
    app.post('/w/:name/:secret', mesg.redirect);

    app.get('/w/:name/:secret/:user', mesg.show);
    app.post('/w/:name/:secret/:user', mesg.send);
    app.get('/w/:name/:secret/:user/page/:page(\\d+)', mesg.show);
    app.post('/w/:name/:secret/:user/page/:page(\\d+)', mesg.send);

    app.post('/w/:name/:secret/:user/send', mesg.sendmesg);

    app.get('/test', test);
    app.get('*', function(req, res){
        return res.render('homepage', {title: '404'});
    });
}
