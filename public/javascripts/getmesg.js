function createXHR() {
    var xhr;
    if (window.ActiveXObject) {
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
        catch(e) { xhr = null; }
    } else
        xhr = new XMLHttpRequest();
    return xhr;
}

function genCallback(serverURL) {
    return function() {
        var xhr = createXHR();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var info = xhr.responseText.parseJSON();
                if (!info.err) {
                    info.data.forEach(function(data) {
                        document.getElementById("mesglist").deleteRow(-1);
                        var cell = document.getElementById("mesglist")
                            .insertRow(0).insertCell(0);
                        cell.innerHTML = 
                            '<p>' + data.content + '</p>';
                        cell.innerHTML +=
                            '<div class="note">' +
                                data.author + '@' + data.create +
                            '</div>';
                        if (data.id > glastid)
                            glastid = data.id;
                        if (data.author != gauthor)
                            cell.className="list_info"
                        else
                            cell.className="list_info_mine"
                    });
                    window.setTimeout(genCallback(serverURL), 5000);
                }
            }
        }
        var localtime = Number(Date.now());
        var newURL = serverURL + glastid + "&local=" + localtime;
        xhr.open('GET', newURL, true);
        xhr.send();
    }
}

function setupNotification(serverURL, lastid, author) {
    glastid = lastid; gauthor = author;
    window.setTimeout(genCallback(serverURL + '?lastid='), 5000);
}
