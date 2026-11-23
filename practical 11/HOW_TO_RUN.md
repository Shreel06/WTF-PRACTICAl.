# Practical 11: FoodExpress Online Food Ordering (Bootstrap & Tailwind CSS)

## 📌 Project Architecture (How Files Are Connected)

```
practical 11/
├── index.html          <-- Semantic HTML5 structure (Hero, categories, cards, forms)
├── css/
│   └── style.css       <-- Custom styling complementary to frameworks
├── js/
│   ├── script.js       <-- Interactive UI logic (Cart counter, toast notification)
│   └── tailwind-config.js <-- Custom Tailwind CSS theme extensions
├── server.js           <-- Zero-dependency Node.js HTTP server (port 3000)
├── start-server.bat    <-- 1-Click launcher script
├── README.md           <-- Documentation
├── screenshots/        <-- Output photos across screen sizes
└── .vscode/
    └── launch.json     <-- VS Code F5 Run configuration
```

### 🔗 How Every File Joins Together:
1. **Bootstrap 5 CDN**: Loaded in `<head>` for responsive grid layout (`row`, `col-*`), cards, navbar with hamburger toggle, and alert modals.
2. **Tailwind CSS CDN**: Loaded via script alongside `js/tailwind-config.js` for custom utility classes, food theme color scales, gradients, and hover transitions.
3. **`css/style.css`**: Linked via `<link rel="stylesheet" href="css/style.css">` for smooth scroll behavior and fine-tuned styles.
4. **`js/script.js`**: Linked via `<script src="js/script.js"></script>` at the end of `<body>` to handle add-to-cart clicks, cart count increments, live toast messages, and contact form handling.

---

## 🚀 How to Run in VS Code (Step-by-Step)

### Option 1: VS Code Terminal (Recommended)
1. Open VS Code.
2. Go to **File** -> **Open Folder...** and select:
   `E:\collage\WTF PRACTICAL\practical 11`
3. Open terminal (**Ctrl + `**).
4. Run:
   ```bash
   node server.js
   ```
5. Open your browser and go to:
   **http://localhost:3000**

---

### Option 2: Live Server or Browser
1. Right-click `index.html` in VS Code and select **Open with Live Server** (or double click `index.html` in Chrome/Edge).

---

### Option 3: Double-Click Launcher
1. Open File Explorer to `E:\collage\WTF PRACTICAL\practical 11`.
2. Double-click **`start-server.bat`**.
