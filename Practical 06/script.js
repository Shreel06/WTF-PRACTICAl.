var packages = [];
var currentType = "All";
var offerIndex = 0;

var offers = [
  "Flat 20% off on Goa packages this week!",
  "Book 2 and get 1 free on Manali tours!",
  "Early bird offer: Save Rs. 3000 on Ladakh trips!",
  "Free airport pickup on all Kerala packages!"
];

var offerBar = document.getElementById("offerBar");
var popup = document.getElementById("popup");
var closePopupBtn = document.getElementById("closePopup");
var themeBtn = document.getElementById("themeBtn");
var nameForm = document.getElementById("nameForm");
var nameInput = document.getElementById("nameInput");
var greeting = document.getElementById("greeting");
var sessionInfo = document.getElementById("sessionInfo");
var selectedText = document.getElementById("selectedText");
var clearBtn = document.getElementById("clearBtn");
var typeFilter = document.getElementById("typeFilter");
var statusBox = document.getElementById("status");
var retryBtn = document.getElementById("retryBtn");
var packageList = document.getElementById("packageList");

function showOffer() {
  offerBar.textContent = offers[offerIndex];
  offerIndex = offerIndex + 1;
  if (offerIndex >= offers.length) {
    offerIndex = 0;
  }
}

function startOffers() {
  showOffer();
  setInterval(showOffer, 3000);
}

function hidePopup() {
  popup.classList.add("hidden");
}

function showPopup() {
  popup.classList.remove("hidden");
  setTimeout(hidePopup, 8000);
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = type;
}

function applyTheme() {
  var theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    themeBtn.textContent = "Dark Mode";
  }
}

function toggleTheme() {
  var theme = localStorage.getItem("theme");
  if (theme === "dark") {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
  applyTheme();
}

function getSelected() {
  var saved = localStorage.getItem("selectedPackage");
  if (saved === null) {
    return null;
  }
  return JSON.parse(saved);
}

function updateSelectedBox() {
  var selected = getSelected();
  if (selected === null) {
    selectedText.textContent = "No destination selected yet.";
    clearBtn.classList.add("hidden");
  } else {
    selectedText.textContent = "You selected: " + selected.name + " (" + selected.place + ") - Rs. " + selected.price.toLocaleString("en-IN") + " for " + selected.days + " days";
    clearBtn.classList.remove("hidden");
  }
}

function updateSessionInfo() {
  var name = sessionStorage.getItem("visitorName");
  var count = sessionStorage.getItem("selectCount");
  if (count === null) {
    count = 0;
  }
  if (name !== null) {
    greeting.textContent = "Welcome, " + name + "!";
  } else {
    greeting.textContent = "Explore the world with WanderGo";
  }
  sessionInfo.textContent = "Selections made in this session: " + count;
}

function saveName(event) {
  event.preventDefault();
  var name = nameInput.value.trim();
  if (name === "") {
    sessionInfo.textContent = "Please type your name first.";
    return;
  }
  sessionStorage.setItem("visitorName", name);
  nameInput.value = "";
  updateSessionInfo();
}

function selectPackage(id) {
  var chosen = null;
  for (var i = 0; i < packages.length; i++) {
    if (packages[i].id === id) {
      chosen = packages[i];
    }
  }
  if (chosen === null) {
    return;
  }
  localStorage.setItem("selectedPackage", JSON.stringify(chosen));

  var count = sessionStorage.getItem("selectCount");
  if (count === null) {
    count = 0;
  }
  sessionStorage.setItem("selectCount", Number(count) + 1);

  updateSelectedBox();
  updateSessionInfo();
  displayPackages();
}

function clearSelection() {
  localStorage.removeItem("selectedPackage");
  updateSelectedBox();
  displayPackages();
}

function displayPackages(callback) {
  var selected = getSelected();
  var html = "";
  var count = 0;

  for (var i = 0; i < packages.length; i++) {
    var p = packages[i];
    if (currentType === "All" || p.type === currentType) {
      var extraClass = "";
      var buttonText = "Select";
      if (selected !== null && selected.id === p.id) {
        extraClass = " selected";
        buttonText = "Selected";
      }
      html += '<div class="card' + extraClass + '">';
      html += '<div class="icon">' + p.icon + "</div>";
      html += "<h3>" + p.name + "</h3>";
      html += '<p class="place">' + p.place + " | " + p.days + " days</p>";
      html += '<span class="tag">' + p.type + "</span>";
      html += '<p class="desc">' + p.description + "</p>";
      html += '<p class="price">Rs. ' + p.price.toLocaleString("en-IN") + "</p>";
      html += '<button class="btn select-btn" data-id="' + p.id + '">' + buttonText + "</button>";
      html += "</div>";
      count++;
    }
  }

  if (count === 0) {
    html = "<p>No packages found for this type.</p>";
  }

  packageList.innerHTML = html;

  if (callback) {
    callback(count);
  }
}

function showLoading(callback) {
  showStatus("Loading packages, please wait...", "loading");
  retryBtn.classList.add("hidden");
  packageList.innerHTML = "";
  setTimeout(callback, 1000);
}

async function getPackages(onSuccess, onError) {
  var data;
  try {
    var response = await fetch("packages.json");
    if (!response.ok) {
      throw new Error("Server returned status " + response.status);
    }
    data = await response.json();
  } catch (error) {
    onError(error);
    return;
  }
  onSuccess(data);
}

function saveBackup(data) {
  localStorage.setItem("packagesBackup", JSON.stringify(data));
}

function loadBackup() {
  var saved = localStorage.getItem("packagesBackup");
  if (saved === null) {
    return null;
  }
  return JSON.parse(saved);
}

function handleError(error) {
  console.log("Error: " + error.message);
  retryBtn.classList.remove("hidden");

  var backup = loadBackup();
  if (backup !== null) {
    packages = backup;
    displayPackages(function () {
      showStatus("Could not reach the server. Showing your last saved packages.", "error");
    });
  } else {
    packages = [
      { id: 1, name: "Goa Beach Holiday", place: "Goa", days: 4, type: "Beach", description: "Relax on pristine sandy beaches, enjoy water sports, and experience lively coastal culture.", price: 12999, icon: "🏖️" },
      { id: 2, name: "Manali Snow Retreat", place: "Himachal Pradesh", days: 5, type: "Mountain", description: "Breathtaking snowy peaks, scenic valleys, Solang valley adventures, and cozy mountain stays.", price: 15499, icon: "🏔️" },
      { id: 3, name: "Royal Jaipur Heritage", place: "Rajasthan", days: 3, type: "Heritage", description: "Discover grand forts, magnificent palaces, vibrant bazaars, and royal Rajasthani hospitality.", price: 9999, icon: "🏛️" },
      { id: 4, name: "Kerala Backwaters & Tea", place: "Kerala", days: 6, type: "Nature", description: "Serene houseboat cruises through Alleppey backwaters and lush green tea estates of Munnar.", price: 18500, icon: "🌴" },
      { id: 5, name: "Rishikesh River Rafting", place: "Uttarakhand", days: 3, type: "Adventure", description: "Thrilling white water rafting on the Ganges, cliff jumping, bungee jumping, and riverside camping.", price: 8499, icon: "🛶" },
      { id: 6, name: "Ladakh High Passes", place: "Ladakh", days: 7, type: "Adventure", description: "Traverse high altitude mountain passes, Pangong Lake, Nubra Valley, and ancient monasteries.", price: 24999, icon: "🏍️" },
      { id: 7, name: "Andaman Island Escape", place: "Andaman", days: 5, type: "Beach", description: "Crystal-clear turquoise waters, Radhanagar beach, scuba diving, and coral reef exploration.", price: 22000, icon: "🌊" },
      { id: 8, name: "Kaziranga Wildlife Safari", place: "Assam", days: 4, type: "Nature", description: "Explore dense jungles and spot the famous one-horned rhinoceros on jeep and elephant safaris.", price: 13999, icon: "🦏" }
    ];
    saveBackup(packages);
    displayPackages(function () {
      showStatus("Server unreachable (or opened directly as file). Showing default packages.", "error");
    });
  }
}

function loadPage() {
  showLoading(function () {
    getPackages(
      function (data) {
        packages = data;
        saveBackup(data);
        displayPackages(function (count) {
          showStatus("Showing " + count + " packages.", "ok");
        });
      },
      function (error) {
        handleError(error);
      }
    );
  });
}

themeBtn.addEventListener("click", toggleTheme);
nameForm.addEventListener("submit", saveName);
clearBtn.addEventListener("click", clearSelection);
closePopupBtn.addEventListener("click", hidePopup);
retryBtn.addEventListener("click", loadPage);

typeFilter.addEventListener("change", function () {
  currentType = typeFilter.value;
  displayPackages(function (count) {
    showStatus("Showing " + count + " packages.", "ok");
  });
});

packageList.addEventListener("click", function (event) {
  if (event.target.classList.contains("select-btn")) {
    var id = Number(event.target.getAttribute("data-id"));
    selectPackage(id);
  }
});

window.addEventListener("offline", function () {
  showStatus("You are offline. Some features may not work.", "error");
});

window.addEventListener("online", function () {
  loadPage();
});

applyTheme();
updateSelectedBox();
updateSessionInfo();
startOffers();
setTimeout(showPopup, 3000);
loadPage();