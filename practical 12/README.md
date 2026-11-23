# City Library - Library Management System

A responsive web application where members can search, borrow and return books, and the admin can add and delete books.

## Technologies
| Layer | Technology |
|-------|-----------|
| Front-end | HTML5, CSS3, JavaScript (fetch API), Bootstrap 5 |
| Server-side | Java 17, Spring Boot (REST API) |
| Database | H2 (file database, saved in the `data` folder) |
| Security | BCrypt, prepared statements, input validation, sessions, security headers |
| Testing | JUnit 5 and manual test cases |
| Version control | Git and GitHub |

## Features
- Register and login with a strong password policy
- Search books by title, author or category
- Borrow a book (maximum 3 at a time) and return it
- Admin can add and delete books
- Responsive layout for mobile, tablet and desktop

## Folder structure
```
library-system/
├── pom.xml
├── Dockerfile
├── .gitignore
├── README.md
└── src/
    ├── main/
    │   ├── java/com/library/
    │   │   ├── LibraryApplication.java
    │   │   ├── AppConfig.java
    │   │   ├── DataSeeder.java
    │   │   ├── Validator.java
    │   │   ├── Access.java
    │   │   ├── Responses.java
    │   │   ├── AuthController.java
    │   │   ├── BookController.java
    │   │   ├── SecurityHeadersFilter.java
    │   │   └── GlobalExceptionHandler.java
    │   └── resources/
    │       ├── application.properties
    │       ├── schema.sql
    │       └── static/
    │           ├── index.html
    │           ├── books.html
    │           ├── css/style.css
    │           └── js/ (api.js, auth.js, books.js)
    └── test/java/com/library/ValidatorTest.java
```

## How to run
1. Install Java 17 and Maven.
2. In the project folder run `mvn spring-boot:run`
3. Open http://localhost:8080
4. Admin login: username `admin`, password `Admin@123` (change it with the environment variable `ADMIN_PASSWORD` before the first run)
5. Run unit tests with `mvn test`

## Database design
- users (id, username, password_hash, user_role)
- books (id, title, author, category, total_copies, available_copies)
- loans (id, user_id, book_id, borrowed_on, returned_on)

One user can have many loans, and one book can appear in many loans.

## REST API
| Method | URL | Who | Purpose |
|--------|-----|-----|---------|
| POST | /api/auth/register | Anyone | Create member account |
| POST | /api/auth/login | Anyone | Login |
| POST | /api/auth/logout | Logged in | Logout |
| GET | /api/auth/me | Logged in | Current user |
| GET | /api/books?q= | Logged in | List or search books |
| POST | /api/books | Admin | Add a book |
| DELETE | /api/books/{id} | Admin | Delete a book |
| POST | /api/books/{id}/borrow | Logged in | Borrow a book |
| POST | /api/books/{id}/return | Logged in | Return a book |
| GET | /api/my-books | Logged in | My current loans |

## Security measures
| Risk | Defence | Where |
|------|---------|-------|
| SQL Injection | Prepared statements with `?` | AuthController, BookController |
| XSS | Input validation, and the front-end uses `textContent` instead of `innerHTML` | Validator.java, js/books.js |
| Weak passwords | Min 8 characters, upper, lower, digit, special, confirm | Validator.java |
| Password theft | BCrypt hashing with salt | AppConfig.java |
| Brute force | Account locked for 5 minutes after 5 failed logins | AuthController |
| Session attacks | New session at login, HttpOnly and SameSite=Strict cookie, 30 minute timeout | AuthController, application.properties |
| Broken access control | Login and admin checks on the server for every protected API | Access.java, controllers |
| Information leakage | Generic error messages, details only in server log | GlobalExceptionHandler.java |
| User enumeration | Same message for wrong username and wrong password | AuthController |
| Clickjacking and content sniffing | X-Frame-Options, nosniff, Content-Security-Policy | SecurityHeadersFilter.java |
| Race condition on borrowing | One atomic UPDATE with `available_copies > 0` inside a transaction | BookController |
| Secrets in code | Admin password and port come from environment variables | application.properties |

## Testing
### Unit tests
`ValidatorTest.java` checks usernames, search text, password rules and book validation.

### Manual test cases (fill the Actual and Pass/Fail columns)
| No | Test | Steps | Expected | Actual | Pass/Fail |
|----|------|-------|----------|--------|-----------|
| 1 | Register with weak password | Register with `abc` | Error message shown | | |
| 2 | Register with strong password | `Strong@123` | Account created | | |
| 3 | Duplicate username | Register same name again | "Username is not available" | | |
| 4 | Wrong login | Wrong password | "Invalid username or password" | | |
| 5 | Lockout | 5 wrong logins | Locked message | | |
| 6 | SQL Injection | Username `admin' --` | Login fails | | |
| 7 | XSS | Search `<script>alert(1)</script>` | Error, no popup | | |
| 8 | Borrow a book | Click Borrow | Count reduces by 1, appears in My Borrowed Books | | |
| 9 | Borrow limit | Borrow 4 books | 4th is rejected | | |
| 10 | Return a book | Click Return | Count increases by 1 | | |
| 11 | Admin only | Login as member | Add form not visible, API returns 403 | | |
| 12 | Add book | Admin adds a book | Book appears in the list | | |
| 13 | Delete borrowed book | Admin deletes a borrowed book | "Currently borrowed" message | | |
| 14 | Direct page access | Open books.html after logout | Redirected to login | | |
| 15 | Responsive | Test 375px, 768px, 1366px in DevTools | Layout adjusts, no sideways scroll | | |

### Debugging tools used
Browser DevTools (Console, Network, Elements), server logs, and `mvn test`.

## Git and GitHub
```
git init
git add .
git commit -m "Initial commit: project setup"
git branch -M main
git remote add origin https://github.com/<your-username>/library-system.git
git push -u origin main
```
Suggested commits as you build: database and security, REST API, front-end pages, tests, README. Use a branch for each feature:
```
git checkout -b feature/borrow-books
git add .
git commit -m "Add borrow and return feature"
git checkout main
git merge feature/borrow-books
git push
```

## Deployment (Render using Docker)
1. Push the project to GitHub.
2. On render.com create a new Web Service and connect the repository.
3. Choose Docker as the runtime (the `Dockerfile` is already included).
4. Add environment variables: `ADMIN_PASSWORD` (a strong password) and `COOKIE_SECURE=true`.
5. Deploy and open the public URL.

The free H2 file database is erased when the server restarts. For real use, switch to MySQL or PostgreSQL by adding its driver in `pom.xml` and changing the `spring.datasource` properties.

## Future improvements
HTTPS-only setup, CSRF tokens, due dates and fines, book cover images, email notifications, password reset.
