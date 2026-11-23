var loginForm = document.getElementById("loginForm");
var registerForm = document.getElementById("registerForm");
var loginMessage = document.getElementById("loginMessage");
var registerMessage = document.getElementById("registerMessage");

async function checkLoggedIn() {
    var result = await api("GET", "/api/auth/me");
    if (result.ok) {
        window.location.href = "books.html";
    }
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage(loginMessage);

    var username = document.getElementById("loginUsername").value.trim();
    var password = document.getElementById("loginPassword").value;

    if (username === "" || password === "") {
        showMessage(loginMessage, "Please enter username and password.", "danger");
        return;
    }

    var result = await api("POST", "/api/auth/login", { username: username, password: password });
    if (result.ok) {
        window.location.href = "books.html";
    } else {
        var text = result.data ? result.data.message : "Login failed.";
        showMessage(loginMessage, text, "danger");
    }
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage(registerMessage);

    var username = document.getElementById("regUsername").value.trim();
    var password = document.getElementById("regPassword").value;
    var confirm = document.getElementById("regConfirm").value;

    if (password !== confirm) {
        showMessage(registerMessage, "Password and confirm password do not match.", "danger");
        return;
    }

    var result = await api("POST", "/api/auth/register",
        { username: username, password: password, confirm: confirm });

    if (result.ok) {
        registerForm.reset();
        showMessage(loginMessage, "Account created. Please log in.", "success");
        bootstrap.Tab.getOrCreateInstance(document.getElementById("login-tab")).show();
    } else {
        var text = result.data ? result.data.message : "Registration failed.";
        showMessage(registerMessage, text, "danger");
    }
});

checkLoggedIn();
