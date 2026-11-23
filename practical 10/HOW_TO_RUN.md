# Practical 10: FinSecure Employee Portal (Web Security & Defensive Coding)

## 📌 Project Architecture (How Files Are Connected)

```
practical 10/
├── server.js           <-- Node.js security server implementing XSS, SQLi & defenses
├── start-server.bat    <-- 1-Click launcher script
├── css/
│   └── style.css       <-- Security status styles (safe, danger, success, error)
├── finsecure-portal/   <-- Original Java / Spring Boot 3 Maven project
│   ├── pom.xml
│   └── src/main/java/com/finsecure/portal/
├── README.md           <-- Documentation
├── screenshots/        <-- Output demonstration screenshots
└── .vscode/
    └── launch.json     <-- VS Code F5 Run configuration
```

### 🔗 How Every File Joins Together:
1. **Frontend Views**: Serves Home, Vulnerable demonstration page, Secure defensive page, and Account Registration.
2. **XSS Demonstration**:
   - `GET /vulnerable?q=...` reflects raw input (simulating unescaped `th:utext`).
   - `GET /secure?q=...` enforces whitelist regex `^[A-Za-z0-9 ]{0,50}$` and HTML character encoding.
3. **SQL Injection Demonstration**:
   - `POST /vulnerable/login` demonstrates raw query string concatenation (`' OR '1'='1`).
   - `POST /secure/login` implements parameterized query simulation (`?` placeholders) and rejection of SQL payloads.
4. **Password Policy & Hashing**:
   - `POST /register` validates 8-64 character length, uppercase, lowercase, digit, and special character rules.
   - Cryptographically hashes passwords with salt before storing, preventing plain-text theft.

---

## 🚀 How to Run in VS Code (Step-by-Step)

### Option 1: VS Code Terminal (Instant Execution with Node.js)
1. Open VS Code.
2. Go to **File** -> **Open Folder...** and select:
   `E:\collage\WTF PRACTICAL\practical 10`
3. Open the built-in terminal (**Ctrl + `**).
4. Run:
   ```bash
   node server.js
   ```
5. Open your browser and navigate to:
   **http://localhost:3000**

---

### Option 2: Run & Debug (F5)
1. Open the folder in VS Code.
2. Press **F5**. The server starts in the Debug Console.
3. Open **http://localhost:3000** in your browser.

---

### Option 3: Double-Click Launcher
1. In Windows Explorer, double-click **`start-server.bat`**.
