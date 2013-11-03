
/**
 * Socket.io main file
 */

var iolib = require('socket.io');
var group = require('../models/group');
var mesg = require('../models/mesg');
var settings = require('../settings');

module.exports = function(server) {
    var io = iolib.listen(server);
    io.enable('browser client minification');
    io.enable('browser client etag');
    //io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        socket.on('join', function(info) { 
            group.checkSecret(info.name, info.secret, function(err) {
                if (!err) {
                    socket.join(info.name);
                    io.sockets.in(info.name).emit('message',
                        { text: info.user + ' joined.',
                          perpage: settings.perpage,
                          mesg: mesg.getNormalizedInfo([{
                              author: 'system',
                              create: Date.now(),
                              content: info.user + ' joined.'
                          }])[0] });
                }
            });
        });
    });
    return module.exports.io = io;
};
