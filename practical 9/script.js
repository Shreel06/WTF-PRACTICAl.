const BASE_URL = "https://dummyjson.com";

const productsDiv = document.getElementById("products");
const messageDiv = document.getElementById("message");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const categorySelect = document.getElementById("categorySelect");
const addForm = document.getElementById("addForm");
const postResult = document.getElementById("postResult");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = "message " + type;
  setTimeout(function () {
    messageDiv.className = "message hidden";
  }, 5000);
}

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Server error: " + response.status + " " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON received from the server.");
    }
    if (error.message.startsWith("Server error")) {
      throw error;
    }
    throw new Error("Network problem. Please check your internet connection.");
  }
}

function displayProducts(products) {
  productsDiv.innerHTML = "";
  if (!Array.isArray(products) || products.length === 0) {
    productsDiv.innerHTML = "<p>No products found.</p>";
    return;
  }
  products.forEach(function (p) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<img src="' + p.thumbnail + '" alt="' + p.title + '">' +
      "<h3>" + p.title + "</h3>" +
      '<span class="cat">' + p.category + "</span>" +
      '<div class="price">$' + p.price + "</div>" +
      '<div class="rating">Rating: ' + p.rating + " / 5</div>" +
      '<button data-id="' + p.id + '">View Details</button>';
    productsDiv.appendChild(card);
  });
}

async function loadProducts(url, successText) {
  showLoader(true);
  productsDiv.innerHTML = "";
  try {
    const data = await apiRequest(url);
    if (!data || !Array.isArray(data.products)) {
      throw new Error("Invalid response format received.");
    }
    displayProducts(data.products);
    showMessage(successText + " (" + data.products.length + " products)", "success");
  } catch (error) {
    showMessage(error.message, "error");
    productsDiv.innerHTML = "<p>Could not load products.</p>";
  } finally {
    showLoader(false);
  }
}

async function loadCategories() {
  try {
    const data = await apiRequest(BASE_URL + "/products/categories");
    if (!Array.isArray(data)) {
      throw new Error("Invalid category data.");
    }
    data.forEach(function (c) {
      const option = document.createElement("option");
      option.value = c.slug;
      option.textContent = c.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    showMessage("Categories failed to load: " + error.message, "error");
  }
}

async function showDetails(id) {
  try {
    const p = await apiRequest(BASE_URL + "/products/" + id);
    modalBody.innerHTML =
      '<img src="' + p.thumbnail + '" alt="' + p.title + '">' +
      "<h2>" + p.title + "</h2>" +
      "<p>" + p.description + "</p>" +
      "<p><b>Brand:</b> " + (p.brand || "N/A") + "</p>" +
      "<p><b>Category:</b> " + p.category + "</p>" +
      "<p><b>Price:</b> $" + p.price + "</p>" +
      "<p><b>Discount:</b> " + p.discountPercentage + "%</p>" +
      "<p><b>Stock:</b> " + p.stock + "</p>" +
      "<p><b>Rating:</b> " + p.rating + " / 5</p>";
    modal.classList.remove("hidden");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

searchBtn.addEventListener("click", function () {
  const q = searchInput.value.trim();
  if (q === "") {
    showMessage("Please type something to search.", "error");
    return;
  }
  categorySelect.value = "";
  loadProducts(BASE_URL + "/products/search?q=" + encodeURIComponent(q), "Search completed");
});

searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

categorySelect.addEventListener("change", function () {
  if (categorySelect.value === "") {
    loadProducts(BASE_URL + "/products?limit=12", "All products loaded");
  } else {
    searchInput.value = "";
    loadProducts(BASE_URL + "/products/category/" + categorySelect.value, "Category loaded");
  }
});

resetBtn.addEventListener("click", function () {
  searchInput.value = "";
  categorySelect.value = "";
  loadProducts(BASE_URL + "/products?limit=12", "Products reloaded");
});

productsDiv.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON") {
    showDetails(e.target.getAttribute("data-id"));
  }
});

closeModal.addEventListener("click", function () {
  modal.classList.add("hidden");
});

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

addForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const newProduct = {
    title: document.getElementById("title").value.trim(),
    price: parseFloat(document.getElementById("price").value),
    category: document.getElementById("category").value.trim(),
    description: document.getElementById("description").value.trim()
  };
  if (newProduct.title === "" || isNaN(newProduct.price) || newProduct.price <= 0) {
    showMessage("Please enter a valid title and price.", "error");
    return;
  }
  try {
    const result = await apiRequest(BASE_URL + "/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    });
    postResult.textContent = JSON.stringify(result, null, 2);
    postResult.classList.remove("hidden");
    showMessage("Product sent successfully. Server assigned ID " + result.id + ".", "success");
    addForm.reset();
  } catch (error) {
    showMessage("POST failed: " + error.message, "error");
  }
});

loadCategories();
loadProducts(BASE_URL + "/products?limit=12", "Products loaded");
