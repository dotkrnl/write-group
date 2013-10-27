function $(x) {
    return document.getElementById(x);
}

function createXHR() {
    var xhr;
    if (window.ActiveXObject) {
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
        catch(e) { xhr = null; }
    } else
        xhr = new XMLHttpRequest();
    return xhr;
}

document.form.onsubmit = function(e) {
    var content = document.form.content.value;
    var server = document.form.action;
    if (!content) {
        var textarea = document.createElement("textarea");
        var input = document.createElement("input");
        input.name = textarea.name = "content";
        input.id = textarea.id = "contentbox";
        input.type = "text";
        input.setAttribute("autocomplete", "off");
        var ori = document.form.content;
        if (ori.tagName == "TEXTAREA") {
            ori.parentNode.replaceChild(input, ori);
        } else {
            ori.parentNode.replaceChild(textarea, ori);
        }
        return false;
    }
    document.form.content.focus();
    document.form.content.disabled = true;
    document.form.btn.disabled = true;
    document.form.btn.value = "writing...";
    e = e || window.event;
    var xhr = createXHR();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var res = eval("(" + xhr.responseText + ")");
            if (!res.err) {
                document.form.content.value = "";
                updater.refreshOnce(); //TODO: updater.refresh();
            }
            document.form.content.disabled = false;
            document.form.btn.disabled = false;
            document.form.btn.value = "write!";
            document.form.content.focus();
            return false;
        }
    };
    var params = "content=" + content;
    xhr.open("POST", server);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
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
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var res = eval("(" + xhr.responseText + ")");
                if (res.count && res.request == updater.latest) {
                    var table = $("mesglist");
                    table.innerHTML = res.html + table.innerHTML;
                    updater.latest = res.latest;
                }
                setTimeout(updater.refresh, updater.interval);
            }
        }
        var localtime = Number(Date.now());
        xhr.open("GET", updater.server + "?latest=" + updater.latest + "&localtime=" + localtime);
        xhr.send();
    },

    //TODO: remove this function!
    refreshOnce: function() {
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var res = eval("(" + xhr.responseText + ")");
                if (res.count && res.request == updater.latest) {
                    var table = $("mesglist");
                    table.innerHTML = res.html + table.innerHTML;
                    updater.latest = res.latest;
                }
                //setTimeout(updater.refresh, updater.interval);
            }
        }
        var localtime = Number(Date.now());
        xhr.open("GET", updater.server + "?latest=" + updater.latest + "&localtime=" + localtime);
        xhr.send();
    }
};
