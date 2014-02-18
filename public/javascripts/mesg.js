var serverTimeout = 10000;

function $(x) {
    return document.getElementById(x);
}

function createXHR() {
    var xhr;
    if (typeof XMLHttpRequest == 'undefined') {
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
        catch(e) { xhr = null; }
    } else { xhr = new XMLHttpRequest(); }
    return xhr;
}

function changeInputLayout() {
    var textarea = document.createElement("textarea");
    var input = document.createElement("input");
    input.name = textarea.name = "content";
    input.id = textarea.id = "contentbox";
    input.type = "text";
    input.setAttribute("autocomplete", "off");
    var origin = document.form.content;
    if (origin.tagName == "TEXTAREA") {
        origin.parentNode.replaceChild(input, origin);
        $("textarea_br").className = 'hidden';
    } else {
        origin.parentNode.replaceChild(textarea, origin);
        $("textarea_br").className = '';
    }
}

function setForm(val) {
    document.form.content.disabled = val;
    document.form.btn.disabled = val;
}

document.form.onsubmit = function(e) {
    var content = document.form.content.value;
    var server = document.form.action + '/send';
    if (!content) {
        changeInputLayout();
        return false;
    }
    var cbRunning = function() {
        document.form.btn.value = "writing...";
        setForm(true);
    };
    var cbDone = function() {
        document.form.btn.value = "write!";
        setForm(false);
        document.form.content.focus();
    };
    cbRunning();
    var xhr = createXHR();
    if (!xhr) { return true; }
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            cbDone();
            if (xhr.responseText) {
                var res = eval("(" + xhr.responseText + ")");
                if (!res.err) { document.form.content.value = ""; }
            }
        }
    };
    var params = "content=" + encodeURIComponent(content);
    xhr.open("POST", server);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    try {
        xhr.timeout = serverTimeout;
        xhr.ontimeout = cbDone;
    } catch(err) {}
    xhr.send(params);
    return false;
};

var updater = {
    name: null,
    user: null,
    socket: null,

    setup: function(name, secret, user, latest) {
        setForm(true);
        updater.name = name;
        updater.user = user;
        updater.socket = io.connect();
        updater.socket.on('message', updater.newMessage);
        updater.socket.on('connect', function() {
            $('offline').className += ' hidden';
            setForm(false);
            updater.socket.emit('join', {name: name, secret: secret});
        });
        updater.socket.on('disconnect', function() {
            $('offline').className = $('offline').className.replace(/\bhidden\b/,'');
            setForm(true);
        });
    },

    newMessage: function(message) {
        var mesglist = $("mesglist");
        var liclass = 'list_info mine';
        if (message.mesg.author != updater.user) {
            liclass = 'list_info other';
        }
        mesglist.innerHTML = '<li class="' + liclass + '">' + message.mesg.content
            + '<div class="note">' + message.mesg.author + '@' + message.mesg.create + '</div>'
            + '</li>' + mesglist.innerHTML;
        while (mesglist.childNodes.length > message.perpage) {
            mesglist.lastChild.parentNode.removeChild(mesglist.lastChild);
        }
        if (typeof window.Notification != 'undefined') {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            } else if (Notification.permission === 'granted'
                    && !document.hasFocus()) {
                var n = new Notification(
                    'New message from ' + message.mesg.author,
                    { 'body' : message.text }
                );
            }
        }
    }
};
