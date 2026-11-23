var cartCount = document.getElementById("cartCount");
var toastText = document.getElementById("toastText");
var toastElement = document.getElementById("cartToast");
var addButtons = document.querySelectorAll(".add-btn");
var count = 0;

addButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        count++;
        cartCount.textContent = count;
        toastText.textContent = button.dataset.name + " added to cart";
        var toast = new bootstrap.Toast(toastElement, { delay: 2000 });
        toast.show();
    });
});

var form = document.getElementById("contactForm");
var success = document.getElementById("formSuccess");

form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (form.checkValidity()) {
        success.classList.remove("d-none");
        form.reset();
        form.classList.remove("was-validated");
    } else {
        success.classList.add("d-none");
        form.classList.add("was-validated");
    }
});

document.getElementById("year").textContent = new Date().getFullYear();
