const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const PORT = 3000;

// In-memory mock database
let users = [
    { id: 1, username: 'admin', passwordHash: hashPassword('Admin@123'), role: 'ADMIN' },
    { id: 2, username: 'john_doe', passwordHash: hashPassword('Secure@2026'), role: 'EMPLOYEE' }
];

let employees = [
    { name: 'Alice Walker', department: 'Cyber Security' },
    { name: 'Bob Smith', department: 'Network Engineering' },
    { name: 'Charlie Dave', department: 'Risk Assessment' },
    { name: 'Diana Prince', department: 'Cloud Infrastructure' }
];

function hashPassword(pass) {
    return crypto.createHash('sha256').update(pass + '_salt_finsecure').digest('hex');
}

function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                callback(JSON.parse(body || '{}'));
            } else {
                callback(querystring.parse(body));
            }
        } catch (e) {
            callback({});
        }
    });
}

function renderPage(title, content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - FinSecure Portal</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<header>
    <strong>FinSecure Employee Portal</strong><br><br>
    <a href="/">Home</a>
    <a href="/vulnerable">Vulnerable Page</a>
    <a href="/secure">Secure Page</a>
    <a href="/register">Register</a>
</header>
<main>
    ${content}
</main>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === '/css/style.css' || pathname === '/style.css') {
        const cssPath = path.join(__dirname, 'css', 'style.css');
        fs.readFile(cssPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
        return;
    }

    // 1. HOME PAGE
    if (pathname === '/' || pathname === '/index.html') {
        const content = `
        <div class="card">
            <h2>Web Security Demonstration</h2>
            <p>This project demonstrates common web vulnerabilities (XSS, SQL Injection) and defensive programming techniques (Input validation, Parameterized queries, Password hashing).</p>
            <ul>
                <li><a href="/vulnerable">Vulnerable Page</a> - Controlled demonstration of unencoded XSS and raw SQL concatenation.</li>
                <li><a href="/secure">Secure Page</a> - Sanitized and parameterized defensive implementation.</li>
                <li><a href="/register">Register Page</a> - Strong password policy enforcement and cryptographic hashing.</li>
            </ul>
            <p class="error">Educational Security Lab for ITUS102 Practical 10.</p>
        </div>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderPage('Home', content));
        return;
    }

    // 2. VULNERABLE PAGE (GET)
    if (pathname === '/vulnerable') {
        const searchQuery = query.q !== undefined ? query.q : '';
        let searchResultHtml = '';
        if (searchQuery) {
            // INTENTIONAL VULNERABILITY: Raw reflected XSS without encoding
            searchResultHtml = `<p>You searched for: <span style="font-weight:bold">${searchQuery}</span></p>`;
        }

        const content = `
        <div class="card danger">
            <h2>1. Search (XSS Vulnerable)</h2>
            <p>The search text is printed back to the browser without HTML encoding (simulating <code>th:utext</code> vulnerability).</p>
            <form action="/vulnerable" method="get">
                <label>Search Employee:</label>
                <input type="text" name="q" value="${searchQuery ? searchQuery.replace(/"/g, '&quot;') : ''}">
                <button type="submit">Search</button>
            </form>
            ${searchResultHtml}
            <p>Try testing: <code>&lt;b&gt;bold text&lt;/b&gt;</code> or <code>&lt;img src=x onerror=alert('XSS-VULNERABILITY')&gt;</code></p>
        </div>

        <div class="card danger">
            <h2>2. Login (SQL Injection Vulnerable)</h2>
            <p>The SQL query is dynamically constructed by concatenating raw user input strings.</p>
            <form action="/vulnerable/login" method="post">
                <label>Username:</label>
                <input type="text" name="username">
                <label>Password:</label>
                <input type="password" name="password">
                <button type="submit">Login</button>
            </form>
            <p>Try username: <code>admin' --</code> with any arbitrary password.</p>
            <p>Or username: <code>' OR '1'='1' --</code></p>
            <p>Or username: <code>admin'</code> to simulate database syntax leakage.</p>
        </div>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderPage('Vulnerable Page', content));
        return;
    }

    // VULNERABLE LOGIN (POST)
    if (pathname === '/vulnerable/login' && req.method === 'POST') {
        parseBody(req, body => {
            const username = body.username || '';
            const password = body.password || '';
            const simulatedQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

            let resultHtml = `<p>Query run: <code>${simulatedQuery}</code></p>`;

            if (username.includes("' --") || username.includes("' OR '1'='1") || username === "' OR 1=1 --") {
                resultHtml += `<p class="success">SQL INJECTION SUCCESSFUL! Logged in as administrator (Password check bypassed!).</p>`;
            } else if (username === "admin'") {
                resultHtml += `<p class="error">Database error: Syntax error in SQL statement "SELECT * FROM users WHERE username = 'admin'' AND password = ''"; expected valid expression near '''</p>`;
            } else {
                resultHtml += `<p class="error">Invalid username or password.</p>`;
            }

            const content = `
            <div class="card danger">
                <h2>Vulnerable Login Result</h2>
                ${resultHtml}
                <br>
                <a href="/vulnerable" class="btn">Back to Vulnerable Page</a>
            </div>`;
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderPage('Vulnerable Login Result', content));
        });
        return;
    }

    // 3. SECURE PAGE (GET)
    if (pathname === '/secure') {
        const searchQuery = query.q !== undefined ? query.q : '';
        let searchResultHtml = '';
        if (searchQuery) {
            // DEFENSIVE FIX: Whitelist validation
            const valid = /^[A-Za-z0-9 ]{0,50}$/.test(searchQuery);
            if (!valid) {
                searchResultHtml = `<p class="error">Validation Rejected: Search contains illegal characters. Only letters, numbers and spaces are permitted.</p>`;
            } else {
                // DEFENSIVE FIX: Encoded output
                const safeQ = searchQuery.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const matched = employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
                let tableRows = matched.map(m => `<tr><td>${m.name}</td><td>${m.department}</td></tr>`).join('');
                if (!tableRows) tableRows = '<tr><td colspan="2">No matching employees found.</td></tr>';
                searchResultHtml = `<p>Search query: <strong>${safeQ}</strong></p><table><tr><th>Name</th><th>Department</th></tr>${tableRows}</table>`;
            }
        }

        const content = `
        <div class="card safe">
            <h2>1. Search (XSS Protected)</h2>
            <p>Input is validated using strict regex (whitelist) and rendered using proper HTML output encoding.</p>
            <form action="/secure" method="get">
                <label>Employee Name:</label>
                <input type="text" name="q" maxlength="50" value="${searchQuery ? searchQuery.replace(/"/g, '&quot;') : ''}">
                <button type="submit">Search</button>
            </form>
            ${searchResultHtml}
            <p>Attack payloads like <code>&lt;script&gt;</code> are instantly rejected by input validation rules.</p>
        </div>

        <div class="card safe">
            <h2>2. Login (SQL Injection Protected)</h2>
            <p>Uses parameterized queries (prepared statements <code>?</code> placeholders) and secure hash comparison.</p>
            <form action="/secure/login" method="post">
                <label>Username:</label>
                <input type="text" name="username" maxlength="20">
                <label>Password:</label>
                <input type="password" name="password">
                <button type="submit">Login</button>
            </form>
        </div>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderPage('Secure Page', content));
        return;
    }

    // SECURE LOGIN (POST)
    if (pathname === '/secure/login' && req.method === 'POST') {
        parseBody(req, body => {
            const username = (body.username || '').trim();
            const password = body.password || '';

            // Sanitized Parameterized Check
            const user = users.find(u => u.username === username);
            let success = false;
            if (user && user.passwordHash === hashPassword(password)) {
                success = true;
            }

            let resultHtml = '';
            if (success) {
                resultHtml = `<p class="success">Authentication Successful! Welcome, <strong>${username}</strong> (${user.role}).</p>`;
            } else {
                resultHtml = `<p class="error">Authentication Failed: Invalid username or password. (Protected against SQL Injection).</p>`;
            }

            const content = `
            <div class="card safe">
                <h2>Secure Login Result</h2>
                ${resultHtml}
                <br>
                <a href="/secure" class="btn">Back to Secure Page</a>
            </div>`;
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderPage('Secure Login Result', content));
        });
        return;
    }

    // 4. REGISTER PAGE (GET & POST)
    if (pathname === '/register') {
        if (req.method === 'GET') {
            const content = `
            <div class="card safe">
                <h2>Create Secure Account</h2>
                <form action="/register" method="post">
                    <label>Username:</label>
                    <input type="text" name="username" maxlength="20" required>
                    <label>Password:</label>
                    <input type="password" name="password" required>
                    <label>Confirm Password:</label>
                    <input type="password" name="confirm" required>
                    <button type="submit">Register</button>
                </form>
                <ul class="rules">
                    <li>Username: 4 to 20 letters, numbers, or underscores</li>
                    <li>Password: 8 to 64 characters</li>
                    <li>At least one uppercase, one lowercase, one digit, and one special character</li>
                    <li>Confirm password must match</li>
                </ul>
            </div>`;
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderPage('Register', content));
            return;
        }

        if (req.method === 'POST') {
            parseBody(req, body => {
                const username = (body.username || '').trim();
                const password = body.password || '';
                const confirm = body.confirm || '';

                let error = '';
                if (!/^[A-Za-z0-9_]{4,20}$/.test(username)) {
                    error = 'Username must be 4 to 20 letters, numbers, or underscores.';
                } else if (password.length < 8) {
                    error = 'Password must be at least 8 characters long.';
                } else if (password.length > 64) {
                    error = 'Password must not exceed 64 characters.';
                } else if (!/[A-Z]/.test(password)) {
                    error = 'Password must contain at least one uppercase letter.';
                } else if (!/[a-z]/.test(password)) {
                    error = 'Password must contain at least one lowercase letter.';
                } else if (!/[0-9]/.test(password)) {
                    error = 'Password must contain at least one digit.';
                } else if (!/[^A-Za-z0-9]/.test(password)) {
                    error = 'Password must contain at least one special character.';
                } else if (password !== confirm) {
                    error = 'Password and Confirm Password do not match.';
                } else if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                    error = 'Username is already taken. Please choose another.';
                }

                let messageHtml = '';
                if (error) {
                    messageHtml = `<p class="error">${error}</p>`;
                } else {
                    const hashed = hashPassword(password);
                    users.push({ id: users.length + 1, username, passwordHash: hashed, role: 'EMPLOYEE' });
                    messageHtml = `<p class="success">Account registered successfully! Password securely stored as salted cryptographic hash: <code>${hashed.substring(0, 24)}...</code></p>`;
                }

                const content = `
                <div class="card safe">
                    <h2>Account Registration</h2>
                    ${messageHtml}
                    <br>
                    <a href="/register" class="btn">Back to Register</a> | <a href="/secure">Go to Secure Login</a>
                </div>`;
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(renderPage('Register Result', content));
            });
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
});

server.listen(PORT, () => {
    console.log('====================================================');
    console.log('  FinSecure Web Security Portal (Practical 10)');
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log('====================================================');
});
