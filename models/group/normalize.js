
/**
 * A tool to check new group info
 */

// callback(dest, err)

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

exports.normalizer = {

    name : function(origin, cb) {
        origin = origin.trim();
        var allow = /^[A-Za-z0-9]+$/; 
        if (allow.test(origin)) return cb(origin);
        else return cb('', 'Bad name format');
    },

    email: function(origin, cb) {
        origin = origin.trim();
        if (!origin.length) return cb('');
        var regEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        if (regEmail.test(origin)) return cb(origin);
        else return cb('', 'Bad email address.');
    },
    
}

exports.normalizeAll = function(origin, cb) {
    var errors = [];
    var result = {};
    var genProcessGet = function(key) {
        return function(dest, err) {
            result[key] = dest;
            if (err) errors.push(err);
        }
    }
    Object.keys(exports.normalizer).forEach(
        function(key) {
            if (typeof(origin[key]) == 'undefined')
                origin[key] = '';
            exports.normalizer[key](origin[key], genProcessGet(key));
        }
    );
    if (errors.length)
        cb(result, errors);
    else cb(result);
}
