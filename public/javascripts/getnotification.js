function createXHR() {
    var xhr;
    if (window.ActiveXObject) {
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
        catch(e) { xhr = null; }
    } else
        xhr = new XMLHttpRequest();
    return xhr;
}

function genncb(serverURL) {
    return function() {
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
                if (xhr.responseText == 1)
                    location.reload(true);
        }
        xhr.open('GET', serverURL, true);
        xhr.send();
    }
}

