# FoodExpress - Responsive Website (Bootstrap + Tailwind CSS)

## How to run
Keep the folder structure as it is, make sure you are online (frameworks load from CDN) and double-click `index.html`.

## Files
- index.html - page structure
- css/style.css - custom styles
- js/script.js - cart counter, toast, form validation
- js/tailwind-config.js - Tailwind settings

## Framework usage
Bootstrap: navbar, collapse menu, grid (row/col), cards, buttons, badge, form controls, validation, toast, alert.
Tailwind: gradients, spacing, rounded corners, shadows, text sizes, responsive grid (`md:tw-grid-cols-2`).
Tailwind classes use the prefix `tw-` and preflight is off, so the two frameworks do not clash (for example both have a class named `collapse`).

## Breakpoints used
| Screen | Width | Behaviour |
|--------|-------|-----------|
| Mobile | below 576px | Menu collapses to hamburger, 1 card per row, 2 categories per row |
| Tablet | 576px - 991px | 2 cards per row, 3 categories per row, offers side by side from 768px |
| Desktop | 992px and above | Full navbar, 4 cards per row, 6 categories per row |

## Testing with developer tools
1. Open index.html in Chrome and press F12.
2. Click the device toolbar icon (or Ctrl+Shift+M).
3. Choose a device from the dropdown or type your own width.
4. Check each item in the table below, then repeat in Firefox (Ctrl+Shift+M for Responsive Design Mode) and Edge.

### Device test (fill in Pass/Fail)
| Device | Width | Menu | Categories | Cards | Offers | Form | Result |
|--------|-------|------|------------|-------|--------|------|--------|
| iPhone SE | 375 | | | | | | |
| iPhone 12 Pro | 390 | | | | | | |
| iPad Mini | 768 | | | | | | |
| iPad Air | 820 | | | | | | |
| Laptop | 1366 | | | | | | |
| Desktop | 1920 | | | | | | |

### Browser test (fill in Pass/Fail)
| Browser | Version | Layout | Navbar toggle | Add to cart | Form validation | Result |
|---------|---------|--------|---------------|-------------|-----------------|--------|
| Chrome | | | | | | |
| Firefox | | | | | | |
| Edge | | | | | | |

## Things to check in DevTools
- No red errors in the Console tab
- No horizontal scrollbar at 320px width
- Network tab shows Bootstrap and Tailwind files loaded
- Elements tab: see which classes come from Bootstrap and which start with tw-
