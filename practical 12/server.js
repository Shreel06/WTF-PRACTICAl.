const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

// Initial Seed Data matching DataSeeder.java
let users = [
    { id: 1, username: 'admin', passwordHash: hashPassword('Admin@123'), role: 'ADMIN' },
    { id: 2, username: 'john', passwordHash: hashPassword('Member@123'), role: 'MEMBER' }
];

let books = [
    { id: 1, title: 'Wings of Fire', author: 'A P J Abdul Kalam', category: 'Biography', totalCopies: 3, availableCopies: 3 },
    { id: 2, title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', totalCopies: 2, availableCopies: 2 },
    { id: 3, title: 'Let Us C', author: 'Yashavant Kanetkar', category: 'Programming', totalCopies: 4, availableCopies: 4 },
    { id: 4, title: 'Clean Code', author: 'Robert Martin', category: 'Programming', totalCopies: 2, availableCopies: 2 },
    { id: 5, title: 'Discovery of India', author: 'Jawaharlal Nehru', category: 'History', totalCopies: 2, availableCopies: 2 },
    { id: 6, title: 'Atomic Habits', author: 'James Clear', category: 'Self Help', totalCopies: 3, availableCopies: 3 }
];

let loans = [];
let sessions = {}; // cookie -> { username, role }

function hashPassword(p) {
    return crypto.createHash('sha256').update(p + '_salt_city_lib').digest('hex');
}

function parseJsonBody(req, callback) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            callback(JSON.parse(body || '{}'));
        } catch (e) {
            callback({});
        }
    });
}

function getSession(req) {
    const cookieHeader = req.headers['cookie'] || '';
    const match = cookieHeader.match(/SESSION_ID=([a-zA-Z0-9_-]+)/);
    if (match && sessions[match[1]]) {
        return { id: match[1], ...sessions[match[1]] };
    }
    return null;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Security Headers (matching SecurityHeadersFilter.java)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Serve Static Files
    if (!pathname.startsWith('/api/')) {
        let reqPath = pathname === '/' ? '/index.html' : pathname;
        let filePath = path.join(__dirname, reqPath);

        // Fallbacks for /css and /js
        if (!fs.existsSync(filePath)) {
            if (reqPath.startsWith('/css/')) filePath = path.join(__dirname, reqPath.replace('/css/', ''));
            if (reqPath.startsWith('/js/')) filePath = path.join(__dirname, reqPath.replace('/js/', ''));
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
            res.end(data);
        });
        return;
    }

    // ------------------- API ROUTES -------------------
    res.setHeader('Content-Type', 'application/json');

    // 1. GET /api/auth/me
    if (pathname === '/api/auth/me' && req.method === 'GET') {
        const session = getSession(req);
        if (!session) {
            res.writeHead(401);
            res.end(JSON.stringify({ message: 'Unauthorized' }));
            return;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ username: session.username, role: session.role }));
        return;
    }

    // 2. POST /api/auth/login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
        parseJsonBody(req, body => {
            const { username, password } = body;
            const user = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase().trim());
            if (!user || user.passwordHash !== hashPassword(password)) {
                res.writeHead(401);
                res.end(JSON.stringify({ message: 'Invalid username or password.' }));
                return;
            }
            const sid = crypto.randomBytes(16).toString('hex');
            sessions[sid] = { username: user.username, role: user.role };
            res.writeHead(200, {
                'Set-Cookie': `SESSION_ID=${sid}; HttpOnly; Path=/; SameSite=Strict`
            });
            res.end(JSON.stringify({ username: user.username, role: user.role }));
        });
        return;
    }

    // 3. POST /api/auth/register
    if (pathname === '/api/auth/register' && req.method === 'POST') {
        parseJsonBody(req, body => {
            const { username, password, confirm } = body;
            const u = (username || '').trim();
            if (!/^[A-Za-z0-9_]{4,20}$/.test(u)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Username must be 4 to 20 letters, numbers, or underscores.' }));
                return;
            }
            if (!password || password.length < 8) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Password must be at least 8 characters long.' }));
                return;
            }
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Password must include uppercase, lowercase, number, and special character.' }));
                return;
            }
            if (password !== confirm) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Passwords do not match.' }));
                return;
            }
            if (users.some(existing => existing.username.toLowerCase() === u.toLowerCase())) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Username is not available.' }));
                return;
            }
            const newUser = { id: users.length + 1, username: u, passwordHash: hashPassword(password), role: 'MEMBER' };
            users.push(newUser);
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Account created successfully! You can now log in.' }));
        });
        return;
    }

    // 4. POST /api/auth/logout
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const session = getSession(req);
        if (session) delete sessions[session.id];
        res.writeHead(200, {
            'Set-Cookie': 'SESSION_ID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        });
        res.end(JSON.stringify({ message: 'Logged out.' }));
        return;
    }

    // Auth Guard for subsequent routes
    const session = getSession(req);
    if (!session) {
        res.writeHead(401);
        res.end(JSON.stringify({ message: 'Please log in first.' }));
        return;
    }

    // 5. GET /api/books
    if (pathname === '/api/books' && req.method === 'GET') {
        const q = (query.q || '').toLowerCase().trim();
        let result = books;
        if (q) {
            result = books.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q)
            );
        }
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
    }

    // 6. POST /api/books (ADMIN only)
    if (pathname === '/api/books' && req.method === 'POST') {
        if (session.role !== 'ADMIN') {
            res.writeHead(403);
            res.end(JSON.stringify({ message: 'Access denied: Administrator privilege required.' }));
            return;
        }
        parseJsonBody(req, body => {
            const { title, author, category, totalCopies } = body;
            const copies = parseInt(totalCopies) || 1;
            const newBook = {
                id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
                title: (title || '').trim(),
                author: (author || '').trim(),
                category: (category || '').trim(),
                totalCopies: copies,
                availableCopies: copies
            };
            books.push(newBook);
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Book added successfully!', book: newBook }));
        });
        return;
    }

    // 7. DELETE /api/books/:id (ADMIN only)
    if (pathname.startsWith('/api/books/') && req.method === 'DELETE') {
        if (session.role !== 'ADMIN') {
            res.writeHead(403);
            res.end(JSON.stringify({ message: 'Access denied.' }));
            return;
        }
        const id = parseInt(pathname.split('/')[3]);
        const isBorrowed = loans.some(l => l.bookId === id && !l.returned);
        if (isBorrowed) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: 'Cannot delete book: Copies are currently borrowed by members.' }));
            return;
        }
        books = books.filter(b => b.id !== id);
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Book deleted successfully.' }));
        return;
    }

    // 8. POST /api/books/:id/borrow
    if (pathname.includes('/borrow') && req.method === 'POST') {
        const id = parseInt(pathname.split('/')[3]);
        const book = books.find(b => b.id === id);
        if (!book) {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Book not found.' }));
            return;
        }
        const activeUserLoans = loans.filter(l => l.username === session.username && !l.returned);
        if (activeUserLoans.length >= 3) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: 'Borrowing limit reached: You cannot borrow more than 3 books.' }));
            return;
        }
        if (book.availableCopies <= 0) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: 'No copies currently available to borrow.' }));
            return;
        }
        book.availableCopies--;
        loans.push({
            id: loans.length + 1,
            username: session.username,
            bookId: book.id,
            borrowedOn: new Date().toLocaleDateString(),
            returned: false
        });
        res.writeHead(200);
        res.end(JSON.stringify({ message: `Successfully borrowed "${book.title}".` }));
        return;
    }

    // 9. POST /api/books/:id/return
    if (pathname.includes('/return') && req.method === 'POST') {
        const id = parseInt(pathname.split('/')[3]);
        const loan = loans.find(l => l.bookId === id && l.username === session.username && !l.returned);
        if (!loan) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: 'No active borrow record found for this book.' }));
            return;
        }
        loan.returned = true;
        const book = books.find(b => b.id === id);
        if (book) book.availableCopies++;
        res.writeHead(200);
        res.end(JSON.stringify({ message: `Successfully returned "${book ? book.title : 'book'}".` }));
        return;
    }

    // 10. GET /api/my-books
    if (pathname === '/api/my-books' && req.method === 'GET') {
        const activeLoans = loans.filter(l => l.username === session.username && !l.returned);
        const myBooks = activeLoans.map(l => {
            const b = books.find(bk => bk.id === l.bookId) || {};
            return {
                id: b.id,
                loanId: l.id,
                title: b.title,
                author: b.author,
                category: b.category,
                borrowedOn: l.borrowedOn
            };
        });
        res.writeHead(200);
        res.end(JSON.stringify(myBooks));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: 'API Endpoint Not Found' }));
});

server.listen(PORT, () => {
    console.log('====================================================');
    console.log('  City Library Management System (Practical 12)');
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log('====================================================');
});
