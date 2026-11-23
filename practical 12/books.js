var currentRole = "";
var message = document.getElementById("message");
var booksBody = document.getElementById("booksBody");
var myBooksList = document.getElementById("myBooksList");
var searchInput = document.getElementById("searchInput");
var searchForm = document.getElementById("searchForm");
var addForm = document.getElementById("addForm");
var adminPanel = document.getElementById("adminPanel");
var messageTimer = null;

function flash(text, type) {
    showMessage(message, text, type);
    clearTimeout(messageTimer);
    messageTimer = setTimeout(function () {
        hideMessage(message);
    }, 4000);
}

async function init() {
    var result = await api("GET", "/api/auth/me");
    if (!result.ok) {
        window.location.href = "index.html";
        return;
    }
    currentRole = result.data.role;
    document.getElementById("welcomeName").textContent = result.data.username;
    document.getElementById("roleBadge").textContent = currentRole;
    if (currentRole === "ADMIN") {
        adminPanel.classList.remove("d-none");
    }
    await loadBooks("");
    await loadMyBooks();
}

async function loadBooks(query) {
    var result = await api("GET", "/api/books?q=" + encodeURIComponent(query));
    if (result.status === 401) {
        window.location.href = "index.html";
        return;
    }
    if (!result.ok) {
        flash(result.data ? result.data.message : "Could not load books.", "danger");
        return;
    }
    renderBooks(result.data);
}

function renderBooks(books) {
    booksBody.replaceChildren();

    if (books.length === 0) {
        var emptyRow = makeElement("tr");
        var emptyCell = makeElement("td", "No books found.", "text-center text-muted");
        emptyCell.colSpan = 5;
        emptyRow.appendChild(emptyCell);
        booksBody.appendChild(emptyRow);
        return;
    }

    books.forEach(function (book) {
        var row = makeElement("tr");
        row.appendChild(makeElement("td", book.title, "fw-semibold"));
        row.appendChild(makeElement("td", book.author));
        row.appendChild(makeElement("td", book.category));

        var stockCell = makeElement("td");
        var badgeClass = book.available_copies > 0 ? "badge text-bg-success" : "badge text-bg-danger";
        stockCell.appendChild(makeElement("span", book.available_copies + " / " + book.total_copies, badgeClass));
        row.appendChild(stockCell);

        var actionCell = makeElement("td", null, "text-nowrap");
        var borrowButton = makeElement("button", "Borrow", "btn btn-sm btn-primary me-1");
        borrowButton.disabled = book.available_copies === 0;
        borrowButton.addEventListener("click", function () {
            borrowBook(book.id);
        });
        actionCell.appendChild(borrowButton);

        if (currentRole === "ADMIN") {
            var deleteButton = makeElement("button", "Delete", "btn btn-sm btn-outline-danger");
            deleteButton.addEventListener("click", function () {
                deleteBook(book.id, book.title);
            });
            actionCell.appendChild(deleteButton);
        }

        row.appendChild(actionCell);
        booksBody.appendChild(row);
    });
}

async function loadMyBooks() {
    var result = await api("GET", "/api/my-books");
    if (!result.ok) {
        return;
    }
    myBooksList.replaceChildren();

    if (result.data.length === 0) {
        myBooksList.appendChild(makeElement("li", "You have not borrowed any books.", "list-group-item text-muted"));
        return;
    }

    result.data.forEach(function (loan) {
        var item = makeElement("li", null, "list-group-item loan-item d-flex justify-content-between align-items-center flex-wrap gap-2");
        var info = makeElement("div");
        info.appendChild(makeElement("div", loan.title, "fw-semibold"));
        info.appendChild(makeElement("small", loan.author + " | Borrowed on " + loan.borrowed_on, "text-muted"));
        item.appendChild(info);

        var returnButton = makeElement("button", "Return", "btn btn-sm btn-success");
        returnButton.addEventListener("click", function () {
            returnBook(loan.id);
        });
        item.appendChild(returnButton);
        myBooksList.appendChild(item);
    });
}

async function refresh() {
    await loadBooks(searchInput.value.trim());
    await loadMyBooks();
}

async function borrowBook(id) {
    var result = await api("POST", "/api/books/" + id + "/borrow");
    flash(result.data ? result.data.message : "Request failed.", result.ok ? "success" : "danger");
    await refresh();
}

async function returnBook(id) {
    var result = await api("POST", "/api/books/" + id + "/return");
    flash(result.data ? result.data.message : "Request failed.", result.ok ? "success" : "danger");
    await refresh();
}

async function deleteBook(id, title) {
    if (!confirm("Delete the book '" + title + "'?")) {
        return;
    }
    var result = await api("DELETE", "/api/books/" + id);
    flash(result.data ? result.data.message : "Request failed.", result.ok ? "success" : "danger");
    await refresh();
}

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loadBooks(searchInput.value.trim());
});

addForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var book = {
        title: document.getElementById("bookTitle").value,
        author: document.getElementById("bookAuthor").value,
        category: document.getElementById("bookCategory").value,
        copies: parseInt(document.getElementById("bookCopies").value, 10)
    };
    var result = await api("POST", "/api/books", book);
    flash(result.data ? result.data.message : "Request failed.", result.ok ? "success" : "danger");
    if (result.ok) {
        addForm.reset();
        await refresh();
    }
});

document.getElementById("logoutButton").addEventListener("click", async function () {
    await api("POST", "/api/auth/logout");
    window.location.href = "index.html";
});

init();
