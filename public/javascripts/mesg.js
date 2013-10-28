var serverTimeout = 10000;

function $(x) {
    return document.getElementById(x);
}

function createXHR() {
    var xhr;
    if (!XMLHttpRequest) {
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
        catch(e) { xhr = null; }
    } else xhr = new XMLHttpRequest();
    return xhr;
}

var changeInputLayout = function() {
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

document.form.onsubmit = function(e) {
    var content = document.form.content.value;
    var server = document.form.action;
    if (!content) {
        changeInputLayout();
        return false;
    }
    var cbRunning = function() {
        document.form.content.focus();
        document.form.content.disabled = true;
        document.form.btn.disabled = true;
        document.form.btn.value = "writing...";
    }
    var cbDone = function() {
        document.form.content.disabled = false;
        document.form.btn.disabled = false;
        document.form.btn.value = "write!";
        document.form.content.focus();
        updater.refreshOnce();
    }
    cbRunning();
    var xhr = createXHR();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            cbDone();
            if (xhr.responseText) {
                var res = eval("(" + xhr.responseText + ")");
                if (!res.err) document.form.content.value = "";
            }
        }
    };
    var params = "content=" + content;
    xhr.open("POST", server);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    try {
        xhr.timeout = serverTimeout;
        xhr.ontimeout = cbDone;
    } catch(e) {}
    xhr.send(params);
    return false;
};

var updater = {
    server: null,
    latest: null,
    interval: 5000,

    setup: function(server, latest) {
        updater.server = server;
        updater.latest = latest;
        updater.refresh();
    },

    refresh: function() {
        updater.refreshOnce(function() {
            setTimeout(updater.refresh, updater.interval);
        });
    },

    refreshOnce: function(cb) {
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (cb) cb();
                if (xhr.responseText) {
                    var res = eval("(" + xhr.responseText + ")");
                    if (res.count && res.request == updater.latest) {
                        var table = $("mesglist");
                        table.innerHTML = res.html + table.innerHTML;
                        updater.latest = res.latest;
                    }
                }
            }
        }
        var localtime = Number(Date.now());
        try {
            xhr.timeout = serverTimeout;
            if (cb) xhr.ontimeout = cb;
        } catch(e) {}
        xhr.open("GET", updater.server + "?latest=" + updater.latest + "&localtime=" + localtime);
        xhr.send();
    }
};
