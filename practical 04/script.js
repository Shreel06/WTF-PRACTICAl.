var message = document.getElementById("message");
var productList = document.getElementById("productList");
var cartList = document.getElementById("cartList");
var totalSpan = document.getElementById("total");
var previewImg = document.getElementById("previewImg");
var previewName = document.getElementById("previewName");
var cart = [];
var total = 0;
var extraCount = 0;

function showMessage(text, type) {
  message.textContent = text;
  message.className = type || "";
}

function makePicture(emoji, color) {
  var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>" +
    "<rect width='300' height='200' fill='" + color + "'/>" +
    "<text x='150' y='125' font-size='90' text-anchor='middle'>" + emoji + "</text></svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function setupProduct(item) {
  var pic = item.querySelector("img");
  pic.src = makePicture(item.dataset.emoji, item.dataset.color);
  pic.title = "Click to preview";
}

function updateStats() {
  var allProducts = document.getElementsByClassName("product");
  var allImages = document.getElementsByTagName("img");
  var visible = document.querySelectorAll(".product:not([style*='display: none'])");
  document.getElementById("stats").textContent =
    "Showing " + visible.length + " of " + allProducts.length + " products (" + allImages.length + " images on this page).";
}

var products = document.querySelectorAll(".product");
for (var i = 0; i < products.length; i++) {
  setupProduct(products[i]);
}
updateStats();

var themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "Light mode";
    showMessage("Dark mode is on.", "success");
  } else {
    themeBtn.textContent = "Dark mode";
    showMessage("Light mode is on.", "success");
  }
});

var menuBtn = document.getElementById("menuBtn");
var menuList = document.getElementById("menuList");
menuBtn.addEventListener("click", function () {
  menuList.classList.toggle("open");
});

var heroTitle = document.getElementById("heroTitle");
var heroText = document.getElementById("heroText");
var oldTitle = heroTitle.textContent;
var oldText = heroText.textContent;

document.getElementById("changeBtn").addEventListener("click", function () {
  heroTitle.textContent = "Today's offer: 20% off on all Tech!";
  heroText.innerHTML = "Use code <b>EASY20</b> at checkout.";
  heroTitle.style.color = "#e4572e";
  heroTitle.setAttribute("title", "Offer valid today only");
  showMessage("Offer shown. Content, style and attribute were changed with JavaScript.", "success");
});

document.getElementById("resetBtn").addEventListener("click", function () {
  heroTitle.textContent = oldTitle;
  heroText.textContent = oldText;
  heroTitle.style.color = "";
  heroTitle.removeAttribute("title");
  showMessage("Heading reset to normal.");
});

function showPreview(item) {
  previewImg.src = makePicture(item.dataset.emoji, item.dataset.color);
  previewName.textContent = item.dataset.name + " - Rs. " + item.dataset.price;
}

productList.addEventListener("mouseover", function (e) {
  var item = e.target.closest(".product");
  if (item) {
    item.classList.add("hovered");
    showPreview(item);
  }
});

productList.addEventListener("mouseout", function (e) {
  var item = e.target.closest(".product");
  if (item) {
    item.classList.remove("hovered");
  }
});

productList.addEventListener("dblclick", function (e) {
  var item = e.target.closest(".product");
  if (item) {
    item.classList.toggle("liked");
    if (item.classList.contains("liked")) {
      showMessage("You saved " + item.dataset.name + " to your favourites.", "success");
    } else {
      showMessage("Removed " + item.dataset.name + " from favourites.");
    }
  }
});

productList.addEventListener("click", function (e) {
  var item = e.target.closest(".product");
  if (!item) return;
  if (e.target.tagName === "IMG") {
    showPreview(item);
    showMessage("Previewing " + item.dataset.name + ".");
  }
  if (e.target.classList.contains("buyBtn")) {
    addToCart(item.dataset.name, Number(item.dataset.price));
  }
});

function addToCart(name, price) {
  if (cart.length === 0) {
    cartList.innerHTML = "";
  }
  var li = document.createElement("li");
  li.textContent = name + " - Rs. " + price;
  var removeBtn = document.createElement("button");
  removeBtn.textContent = "x";
  removeBtn.setAttribute("aria-label", "Remove " + name);
  removeBtn.addEventListener("click", function () {
    cartList.removeChild(li);
    cart.splice(cart.indexOf(li), 1);
    total = total - price;
    totalSpan.textContent = total;
    if (cart.length === 0) {
      cartList.innerHTML = "<li class='empty'>Cart is empty</li>";
    }
    showMessage(name + " removed from cart.", "error");
  });
  li.appendChild(removeBtn);
  cartList.appendChild(li);
  cart.push(li);
  total = total + price;
  totalSpan.textContent = total;
  showMessage(name + " added to cart.", "success");
}

document.getElementById("clearBtn").addEventListener("click", function () {
  if (cart.length === 0) {
    showMessage("Your cart is already empty.", "error");
    return;
  }
  cart = [];
  total = 0;
  totalSpan.textContent = total;
  cartList.innerHTML = "<li class='empty'>Cart is empty</li>";
  showMessage("Cart cleared.");
});

document.getElementById("replaceBtn").addEventListener("click", function () {
  var newText = document.createElement("p");
  newText.id = "previewName";
  newText.textContent = "Preview text replaced using replaceChild().";
  var oldPara = document.getElementById("previewName");
  oldPara.parentNode.replaceChild(newText, oldPara);
  previewName = newText;
  showMessage("An element was replaced in the DOM.");
});

document.getElementById("addProductBtn").addEventListener("click", function () {
  extraCount++;
  var li = document.createElement("li");
  li.className = "product";
  li.dataset.category = "home";
  li.dataset.name = "Mystery Box " + extraCount;
  li.dataset.price = String(499 + extraCount * 100);
  li.dataset.color = "#8d5a97";
  li.dataset.emoji = "🎁";
  li.innerHTML = "<img alt='Mystery Box'><h3>Mystery Box " + extraCount + "</h3><p>Rs. " + li.dataset.price + "</p>";
  var buy = document.createElement("button");
  buy.className = "buyBtn";
  buy.textContent = "Add to cart";
  var del = document.createElement("button");
  del.textContent = "Remove";
  del.style.marginLeft = "6px";
  del.addEventListener("click", function () {
    productList.removeChild(li);
    updateStats();
    showMessage("Product removed from the list.", "error");
  });
  li.appendChild(buy);
  li.appendChild(del);
  productList.appendChild(li);
  setupProduct(li);
  updateStats();
  showMessage("New product added to the list.", "success");
});

var searchBox = document.getElementById("searchBox");
var categorySelect = document.getElementById("categorySelect");

function filterProducts() {
  var word = searchBox.value.toLowerCase();
  var category = categorySelect.value;
  var items = document.getElementsByClassName("product");
  for (var i = 0; i < items.length; i++) {
    var matchName = items[i].dataset.name.toLowerCase().indexOf(word) !== -1;
    var matchCat = category === "all" || items[i].dataset.category === category;
    if (matchName && matchCat) {
      items[i].style.display = "";
    } else {
      items[i].style.display = "none";
    }
  }
  updateStats();
}

searchBox.addEventListener("keyup", function () {
  filterProducts();
  if (searchBox.value === "") {
    showMessage("Search cleared.");
  } else {
    showMessage("Searching for \"" + searchBox.value + "\"...");
  }
});

searchBox.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    searchBox.value = "";
    filterProducts();
    showMessage("Search cleared with the Escape key.");
  }
});

categorySelect.addEventListener("change", function () {
  filterProducts();
  showMessage("Category changed to " + categorySelect.value + ".", "success");
});

var commentInput = document.getElementById("commentInput");
var counter = document.getElementById("counter");
var commentList = document.getElementById("commentList");

commentInput.addEventListener("keyup", function () {
  counter.textContent = commentInput.value.length + " / 120 characters";
  if (commentInput.value.length >= 100) {
    counter.style.color = "#d90429";
  } else {
    counter.style.color = "";
  }
});

document.getElementById("reviewForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var name = document.getElementById("nameInput").value.trim();
  var text = commentInput.value.trim();
  if (name === "" || text === "") {
    showMessage("Please enter both your name and a comment.", "error");
    return;
  }
  var li = document.createElement("li");
  var who = document.createElement("strong");
  who.textContent = name;
  var what = document.createElement("p");
  what.textContent = text;
  var del = document.createElement("button");
  del.textContent = "Delete comment";
  del.addEventListener("click", function () {
    li.remove();
    showMessage("Comment deleted.", "error");
  });
  li.appendChild(who);
  li.appendChild(what);
  li.appendChild(del);
  commentList.prepend(li);
  document.getElementById("reviewForm").reset();
  counter.textContent = "0 / 120 characters";
  showMessage("Thanks " + name + "! Your comment was posted.", "success");
});