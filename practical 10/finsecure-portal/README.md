# FinSecure Employee Portal - Web Security Lab

## How to run
1. Install Java 17 and Maven.
2. In this folder run: `mvn spring-boot:run`
3. Open http://localhost:8080

## Demo steps
| Demo | Where | Input | Result |
|------|-------|-------|--------|
| XSS | Vulnerable page, search | `<img src=x onerror=alert('XSS')>` | Script runs in the browser |
| XSS fixed | Secure page, search | same text | Rejected by validation |
| SQL Injection | Vulnerable page, login | username `admin' --`, any password | Logs in without the password |
| SQL Injection | Vulnerable page, login | username `admin'` | Raw database error is shown |
| SQL fixed | Secure page, login | same text | "Invalid username or password." |
| Password policy | Register | `abc123` | Policy message shown |

## How the vulnerabilities happen
- XSS: user input is placed in the HTML page without encoding (`th:utext`), so the browser treats it as code.
- SQL Injection: user input is joined into the SQL string, so the attacker's text changes the meaning of the query.

## Security measures implemented
1. Input validation: whitelist rules in `Validator.java` for search text and usernames.
2. Output encoding: Thymeleaf `th:text` converts `<` and `>` to safe characters.
3. Parameterized queries: `?` placeholders in `SecureController.java`.
4. Password policy: minimum 8 characters, uppercase, lowercase, digit, special character, confirm match, maximum 64.
5. Password hashing: BCrypt with automatic salt (`BCryptPasswordEncoder` from the Spring framework). Plain passwords are never stored.
6. Error handling: generic messages for users, details only in the server log (`GlobalExceptionHandler.java`, `application.properties`).
7. Same message for wrong username and wrong password, to avoid revealing which usernames exist.
8. Duplicate username gives a neutral message.

## Further improvements (not done in this lab)
HTTPS, CSRF tokens, Content-Security-Policy header, login attempt limits, sessions with secure cookies, role-based access.
