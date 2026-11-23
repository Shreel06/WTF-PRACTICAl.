async function api(method, url, body) {
    var options = { method: method, headers: {} };
    if (body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }
    var response = await fetch(url, options);
    var data = null;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }
    return { ok: response.ok, status: response.status, data: data };
}

function showMessage(element, text, type) {
    element.className = "alert alert-" + type;
    element.textContent = text;
}

function hideMessage(element) {
    element.className = "d-none";
    element.textContent = "";
}

function makeElement(tag, text, className) {
    var element = document.createElement(tag);
    if (text !== undefined && text !== null) {
        element.textContent = text;
    }
    if (className) {
        element.className = className;
    }
    return element;
}
