# Practical 12: City Library Management System (Integrated Web Application)

## 📌 Project Architecture (How Files Are Connected)

```
practical 12/
├── index.html          <-- Authentication Interface (Login & Register modals)
├── books.html          <-- Dashboard (Book catalog, search, borrow, return, admin panel)
├── css/
│   └── style.css       <-- App styles & badges
├── js/
│   ├── api.js          <-- Reusable HTTP client wrapper for fetch()
│   ├── auth.js         <-- Client-side login & registration logic
│   └── books.js        <-- Dynamic DOM manipulation for loans, catalog & admin
├── server.js           <-- Complete Node.js / Express backend with full REST APIs
├── start-server.bat    <-- 1-Click launcher script
├── README.md           <-- Project documentation & manual test matrix
├── screenshots/        <-- Live output screenshots
└── .vscode/
    └── launch.json     <-- VS Code F5 Run configuration
```

### 🔑 Login Credentials:
| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `Admin@123` |
| **Member** | `john` | `Member@123` |

---

## 🚀 How to Run in VS Code (Step-by-Step)

### Option 1: VS Code Terminal (Recommended)
1. Open VS Code.
2. Go to **File** -> **Open Folder...** and select:
   `E:\collage\WTF PRACTICAL\practical 12`
3. Open terminal (**Ctrl + `**).
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
1. Open File Explorer to `E:\collage\WTF PRACTICAL\practical 12`.
2. Double-click **`start-server.bat`**.
