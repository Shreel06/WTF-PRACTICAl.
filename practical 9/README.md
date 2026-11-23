# QuickShop - REST API Integration

Base URL: https://dummyjson.com (public REST API, no key needed)

## Endpoints used

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | /products?limit=12 | Load product list |
| 2 | GET | /products/search?q=phone | Search products |
| 3 | GET | /products/categories | Fill category dropdown |
| 4 | GET | /products/category/{slug} | Products of one category |
| 5 | GET | /products/{id} | Single product details |
| 6 | POST | /products/add | Send a new product as JSON |

## JSON structures

GET /products response:
{
  "products": [
    { "id": 1, "title": "...", "description": "...", "category": "beauty",
      "price": 9.99, "discountPercentage": 7.17, "rating": 4.94,
      "stock": 5, "brand": "...", "thumbnail": "https://..." }
  ],
  "total": 194, "skip": 0, "limit": 12
}

POST /products/add request (Content-Type: application/json):
{ "title": "Test Shoe", "price": 49.99, "category": "shoes", "description": "Nice shoe" }

POST response:
{ "id": 195, "title": "Test Shoe", "price": 49.99, "category": "shoes", "description": "Nice shoe" }

Note: the POST is simulated by the server. The product is not stored permanently.

## Error handling

| Situation | Message shown |
|-----------|---------------|
| No internet | Network problem. Please check your internet connection. |
| HTTP 404 / 500 | Server error: <code> <text> |
| Bad JSON | Invalid JSON received from the server. |
| Wrong structure | Invalid response format received. |
| Empty search | Please type something to search. |

## Test cases

1. Open page: 12 product cards appear.
2. Search "phone": only phone products appear.
3. Search "zzzz": "No products found."
4. Choose a category: matching products appear.
5. Click View Details: popup with full info.
6. Submit the form: green success message and JSON response shown.
7. Turn off internet and click Reset: red network error message.

## How to run

Keep index.html, style.css and script.js in one folder and open index.html in a browser.
