(function () {
  var form = document.getElementById("regForm");
  var summary = document.getElementById("summary");
  var success = document.getElementById("success");

  var patterns = {
    name: /^[A-Za-z]+([ '\-][A-Za-z]+)*$/,
    email: /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/,
    mobile: /^[6-9][0-9]{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
    username: /^[A-Za-z][A-Za-z0-9_]{3,14}$/,
    address: /^[A-Za-z0-9 ,.\-\/#()]+$/
  };

  var passRules = {
    len: function (p) { return p.length >= 8 && p.length <= 32; },
    upper: function (p) { return /[A-Z]/.test(p); },
    lower: function (p) { return /[a-z]/.test(p); },
    digit: function (p) { return /[0-9]/.test(p); },
    special: function (p) { return /[@#$%!&*]/.test(p); },
    space: function (p) { return p.length > 0 && !/\s/.test(p); }
  };

  function clean(value) {
    return value.replace(/[<>"`\\]/g, "").replace(/\s+/g, " ").trim();
  }

  function $(id) { return document.getElementById(id); }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function toISO(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  var today = new Date();
  var maxAppt = new Date();
  maxAppt.setDate(maxAppt.getDate() + 60);
  $("dob").max = toISO(today);
  $("apptDate").min = toISO(today);
  $("apptDate").max = toISO(maxAppt);

  function getAge(dobStr) {
    var d = new Date(dobStr);
    var age = today.getFullYear() - d.getFullYear();
    var m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) { age--; }
    return age;
  }

  var validators = {
    firstName: function (v) {
      if (!v) return "First name is required.";
      if (v.length < 2) return "First name must have at least 2 letters.";
      if (!patterns.name.test(v)) return "Use letters only (space, hyphen or apostrophe allowed between words).";
      return "";
    },
    lastName: function (v) {
      if (!v) return "Last name is required.";
      if (!patterns.name.test(v)) return "Use letters only (space, hyphen or apostrophe allowed between words).";
      return "";
    },
    dob: function (v) {
      if (!v) return "Date of birth is required.";
      var d = new Date(v);
      if (isNaN(d.getTime())) return "Enter a valid date.";
      if (d > today) return "Date of birth cannot be in the future.";
      if (v < "1900-01-01") return "Date of birth cannot be before 1900.";
      if (getAge(v) > 120) return "Please check the year of birth.";
      return "";
    },
    bloodGroup: function (v) {
      return v ? "" : "Please select a blood group.";
    },
    email: function (v) {
      if (!v) return "Email address is required.";
      if (v.length > 60) return "Email is too long (maximum 60 characters).";
      if (/\.\./.test(v)) return "Email cannot contain two dots in a row.";
      if (!patterns.email.test(v)) return "Enter a valid email like name@example.com.";
      return "";
    },
    mobile: function (v) {
      if (!v) return "Mobile number is required.";
      if (/[^0-9]/.test(v)) return "Mobile number must contain digits only.";
      if (v.length !== 10) return "Mobile number must be exactly 10 digits.";
      if (!patterns.mobile.test(v)) return "Mobile number must start with 6, 7, 8 or 9.";
      return "";
    },
    address: function (v) {
      if (!v) return "Address is required.";
      if (v.length < 10) return "Address is too short (minimum 10 characters).";
      if (!patterns.address.test(v)) return "Address can have letters, digits and , . - / # ( ) only.";
      return "";
    },
    pincode: function (v) {
      if (!v) return "PIN code is required.";
      if (!patterns.pincode.test(v)) return "PIN code must be 6 digits and cannot start with 0.";
      return "";
    },
    emergency: function (v) {
      if (!v) return "Emergency contact number is required.";
      if (!patterns.mobile.test(v)) return "Enter a valid 10-digit number starting with 6-9.";
      if (v === $("mobile").value.trim()) return "Emergency number must be different from your mobile number.";
      return "";
    },
    department: function (v) {
      return v ? "" : "Please select a department.";
    },
    apptDate: function (v) {
      if (!v) return "Appointment date is required.";
      if (v < toISO(today)) return "Appointment date cannot be in the past.";
      if (v > toISO(maxAppt)) return "Appointments can be booked up to 60 days ahead.";
      var day = new Date(v).getDay();
      if (day === 0) return "The hospital OPD is closed on Sundays. Pick another day.";
      return "";
    },
    report: function () {
      var f = $("report").files[0];
      if (!f) return "";
      var ext = f.name.split(".").pop().toLowerCase();
      if (["pdf", "jpg", "jpeg", "png"].indexOf(ext) === -1) return "Only PDF, JPG or PNG files are allowed.";
      if (f.size > 2 * 1024 * 1024) return "File is larger than 2 MB.";
      if (f.size === 0) return "The selected file is empty.";
      return "";
    },
    username: function (v) {
      if (!v) return "Username is required.";
      if (!patterns.username.test(v)) return "4-15 characters, start with a letter, use letters, digits or _ only.";
      return "";
    },
    password: function (v) {
      if (!v) return "Password is required.";
      if (!passRules.len(v)) return "Password must be 8 to 32 characters long.";
      if (!passRules.space(v)) return "Password cannot contain spaces.";
      if (!passRules.upper(v)) return "Add at least one uppercase letter.";
      if (!passRules.lower(v)) return "Add at least one lowercase letter.";
      if (!passRules.digit(v)) return "Add at least one digit.";
      if (!passRules.special(v)) return "Add at least one special character (@ # $ % ! & *).";
      var fn = $("firstName").value.trim().toLowerCase();
      if (fn.length > 2 && v.toLowerCase().indexOf(fn) !== -1) return "Password should not contain your first name.";
      var un = $("username").value.trim().toLowerCase();
      if (un.length > 3 && v.toLowerCase().indexOf(un) !== -1) return "Password should not contain your username.";
      return "";
    },
    confirmPassword: function (v) {
      if (!v) return "Please confirm your password.";
      if (v !== $("password").value) return "Passwords do not match.";
      return "";
    }
  };

  var textFields = ["firstName", "lastName", "email", "mobile", "address", "pincode", "emergency", "username"];
  var rawFields = ["password", "confirmPassword"];
  var plainFields = ["dob", "bloodGroup", "department", "apptDate"];

  function showError(id, message) {
    var field = $(id).closest(".field");
    var box = field.querySelector(".msg");
    box.textContent = message;
    field.classList.toggle("invalid", message !== "");
    field.classList.toggle("valid", message === "" && $(id).value !== "");
    $(id).setAttribute("aria-invalid", message !== "" ? "true" : "false");
  }

  function checkField(id) {
    var el = $(id);
    var value;
    if (textFields.indexOf(id) !== -1) {
      value = clean(el.value);
      if (id === "mobile" || id === "emergency" || id === "pincode") { value = el.value.trim(); }
      if (id === "email" || id === "username") { value = el.value.trim(); }
      if (id === "email" && /\s/.test(value)) {
        showError(id, "Email cannot contain spaces.");
        return false;
      }
    } else if (rawFields.indexOf(id) !== -1) {
      value = el.value;
    } else {
      value = el.value;
    }
    var message = validators[id](value);
    showError(id, message);
    return message === "";
  }

  function checkGender() {
    var chosen = form.querySelector("input[name=gender]:checked");
    var box = $("genderField");
    var message = chosen ? "" : "Please select a gender.";
    box.querySelector(".msg").textContent = message;
    box.classList.toggle("invalid", message !== "");
    return message === "";
  }

  function checkTerms() {
    var box = $("termsField");
    var message = $("terms").checked ? "" : "You must accept the terms to register.";
    box.querySelector(".msg").textContent = message;
    box.classList.toggle("invalid", message !== "");
    return message === "";
  }

  function updateStrength() {
    var p = $("password").value;
    var score = 0;
    var items = document.querySelectorAll("#rules li");
    for (var i = 0; i < items.length; i++) {
      var ok = p !== "" && passRules[items[i].getAttribute("data-rule")](p);
      items[i].classList.toggle("ok", ok);
      if (ok) { score++; }
    }
    if (p.length >= 12 && score === 6) { score++; }
    var bar = $("meterBar");
    var text = $("strengthText");
    var label = "-";
    var color = "#c9dadf";
    var width = 0;
    if (p.length > 0) {
      if (score <= 3) { label = "Weak"; color = "#b3261e"; width = 33; }
      else if (score <= 5) { label = "Medium"; color = "#d98a00"; width = 66; }
      else if (score === 6) { label = "Strong"; color = "#1b7f3b"; width = 90; }
      else { label = "Very strong"; color = "#0b7a75"; width = 100; }
    }
    bar.style.width = width + "%";
    bar.style.background = color;
    text.textContent = "Strength: " + label;
    text.style.color = color;
  }

  var allIds = textFields.concat(plainFields, rawFields, ["report"]);

  function validateAll() {
    var errors = [];
    var labels = {
      firstName: "First name", lastName: "Last name", dob: "Date of birth",
      bloodGroup: "Blood group", email: "Email", mobile: "Mobile number",
      address: "Address", pincode: "PIN code", emergency: "Emergency contact",
      department: "Department", apptDate: "Appointment date", report: "Medical report",
      username: "Username", password: "Password", confirmPassword: "Confirm password"
    };
    allIds.forEach(function (id) {
      if (!checkField(id)) { errors.push(labels[id]); }
    });
    if (!checkGender()) { errors.push("Gender"); }
    if (!checkTerms()) { errors.push("Terms and consent"); }
    return errors;
  }

  allIds.forEach(function (id) {
    var el = $(id);
    el.addEventListener("blur", function () {
      if (textFields.indexOf(id) !== -1 && id !== "mobile" && id !== "emergency" && id !== "pincode" && id !== "email" && id !== "username") {
        el.value = clean(el.value);
      }
      if (id === "email" || id === "username") { el.value = el.value.trim(); }
      checkField(id);
    });
    el.addEventListener("input", function () {
      if (id === "mobile" || id === "emergency" || id === "pincode") {
        el.value = el.value.replace(/[^0-9]/g, "");
      }
      if (id === "firstName" || id === "lastName") {
        el.value = el.value.replace(/[^A-Za-z '\-]/g, "");
      }
      if (id === "username") {
        el.value = el.value.replace(/[^A-Za-z0-9_]/g, "");
      }
      if (el.closest(".field").classList.contains("invalid")) { checkField(id); }
      if (id === "password") {
        updateStrength();
        if ($("confirmPassword").value !== "") { checkField("confirmPassword"); }
      }
    });
    el.addEventListener("change", function () { checkField(id); });
  });

  form.querySelectorAll("input[name=gender]").forEach(function (r) {
    r.addEventListener("change", checkGender);
  });
  $("terms").addEventListener("change", checkTerms);

  $("showPass").addEventListener("change", function () {
    var type = this.checked ? "text" : "password";
    $("password").type = type;
    $("confirmPassword").type = type;
  });

  function escapeHTML(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.style.display = "none";
    var errors = validateAll();
    if (errors.length > 0) {
      summary.style.display = "block";
      summary.innerHTML = "<strong>Please fix the following before submitting:</strong><ul>" +
        errors.map(function (x) { return "<li>" + escapeHTML(x) + "</li>"; }).join("") + "</ul>";
      var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (firstBad) { firstBad.focus(); }
      summary.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    summary.style.display = "none";
    var conditions = Array.prototype.map.call(
      form.querySelectorAll("input[name=condition]:checked"),
      function (c) { return c.value; }
    );
    var file = $("report").files[0];
    var rows = [
      ["Name", clean($("firstName").value) + " " + clean($("lastName").value)],
      ["Date of birth", $("dob").value + " (age " + getAge($("dob").value) + ")"],
      ["Gender", form.querySelector("input[name=gender]:checked").value],
      ["Blood group", $("bloodGroup").value],
      ["Email", $("email").value.trim()],
      ["Mobile", $("mobile").value],
      ["Address", clean($("address").value) + " - " + $("pincode").value],
      ["Department", $("department").value],
      ["Appointment date", $("apptDate").value],
      ["Existing conditions", conditions.length ? conditions.join(", ") : "None selected"],
      ["Medical report", file ? file.name : "Not uploaded"],
      ["Username", $("username").value.trim()]
    ];
    success.innerHTML = "<h2>Registration successful</h2><p>Thank you. Your details passed every check. Your password is not shown here for safety.</p><table>" +
      rows.map(function (r) {
        return "<tr><td>" + escapeHTML(r[0]) + "</td><td>" + escapeHTML(r[1]) + "</td></tr>";
      }).join("") + "</table>";
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function resetState() {
    summary.style.display = "none";
    success.style.display = "none";
    document.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("invalid", "valid");
      var m = f.querySelector(".msg");
      if (m) { m.textContent = ""; }
    });
    updateStrength();
  }

  $("resetBtn").addEventListener("click", function () {
    setTimeout(resetState, 0);
  });

  function setValues(map) {
    resetState();
    Object.keys(map).forEach(function (id) { $(id).value = map[id]; });
    updateStrength();
  }

  function nextWeekday() {
    var d = new Date();
    d.setDate(d.getDate() + 3);
    if (d.getDay() === 0) { d.setDate(d.getDate() + 1); }
    return toISO(d);
  }

  $("fillValid").addEventListener("click", function () {
    form.reset();
    setValues({
      firstName: "Aarav", lastName: "Sharma", dob: "2001-05-14", bloodGroup: "B+",
      email: "aarav.sharma@example.com", mobile: "9876543210",
      address: "12, Green Park Road, Vadodara", pincode: "390001", emergency: "9123456780",
      department: "Cardiology", apptDate: nextWeekday(),
      username: "aarav_01", password: "Care@2026Safe", confirmPassword: "Care@2026Safe"
    });
    form.querySelector("input[name=gender][value=Male]").checked = true;
    $("terms").checked = true;
  });

  $("fillInvalid").addEventListener("click", function () {
    form.reset();
    setValues({
      firstName: "A", lastName: "Sharma", dob: toISO(maxAppt), bloodGroup: "",
      email: "aarav..sharma@example", mobile: "12345",
      address: "Home", pincode: "012345", emergency: "5555555555",
      department: "", apptDate: "",
      username: "1ab", password: "abc123", confirmPassword: "abc124"
    });
    $("terms").checked = false;
    validateAll();
  });

  updateStrength();
})();