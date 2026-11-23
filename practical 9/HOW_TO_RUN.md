# Practical 09: QuickShop Online Marketplace (REST API Integration)

## 📌 Project Architecture (How Files Are Connected)

```
practical 9/
├── index.html        <-- User Interface (Search, categories, products grid, add form)
├── style.css         <-- Modern responsive styles (Cards, modal, navbar, badges)
├── script.js         <-- JavaScript connecting to DummyJSON REST API via fetch()
├── server.js         <-- Zero-dependency Node.js HTTP server (serves app on port 3000)
├── start-server.bat  <-- 1-Click launcher script
├── README.md         <-- API documentation, endpoints, and test cases
├── screenshots/      <-- Application execution screenshots
└── .vscode/
    └── launch.json   <-- VS Code F5 Run/Debug configuration
```

### 🔗 How Every File Joins Together:
1. **`index.html`** links **`style.css`** in `<head>` via `<link rel="stylesheet" href="style.css">`.
2. **`index.html`** connects **`script.js`** at the bottom via `<script src="script.js"></script>`.
3. **`script.js`** uses the browser's `fetch()` API to communicate with `https://dummyjson.com`:
   - `GET /products?limit=12` to load products dynamically into cards.
   - `GET /products/search?q=...` to filter items in real-time.
   - `GET /products/categories` to populate the category dropdown.
   - `POST /products/add` to send new product JSON payloads and display confirmation.
4. **`server.js`** acts as the local web server on port 3000, ensuring clean HTTP protocol without CORS or browser file-access issues.

---

## 🚀 How to Run in VS Code (Step-by-Step)

### Option 1: VS Code Terminal (Recommended)
1. Open VS Code.
2. Go to **File** -> **Open Folder...** and select:
   `E:\collage\WTF PRACTICAL\practical 9`
3. Open the built-in terminal (**Ctrl + `** or **Terminal -> New Terminal**).
4. Run:
   ```bash
   node server.js
   ```
5. Open your web browser and navigate to:
   **http://localhost:3000**

---

### Option 2: Live Server or Browser
1. Right-click `index.html` in VS Code and select **Open with Live Server** (or open `index.html` in Chrome).

---

### Option 3: Double-Click Launcher
1. Open File Explorer to `E:\collage\WTF PRACTICAL\practical 9`.
2. Double-click **`start-server.bat`**. It will automatically start the server and open your browser!
