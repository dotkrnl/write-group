
/**
 * Socket.io main file
 */

var iolib = require('socket.io');

var group = require('../models/group');

module.exports = function(server) {
    var io = iolib.listen(server);
    io.enable('browser client minification');
    io.enable('browser client etag');
    //io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        socket.on('join', function(info) { 
            group.checkSecret(info.name, info.secret, function(err) {
                if (!err) socket.join(info.name);
            });
        });
    });
    return module.exports.io = io;
};
