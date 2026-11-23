package com.finsecure.portal;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class SecureController {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;

    public SecureController(JdbcTemplate jdbc, PasswordEncoder encoder) {
        this.jdbc = jdbc;
        this.encoder = encoder;
    }

    @GetMapping("/secure")
    public String page() {
        return "secure";
    }

    @GetMapping("/secure/search")
    public String search(@RequestParam(defaultValue = "") String q, Model model) {
        if (!Validator.isValidSearch(q)) {
            model.addAttribute("searchError",
                    "Only letters, numbers and spaces are allowed (maximum 50 characters).");
            return "secure";
        }

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT name, department FROM employees WHERE LOWER(name) LIKE ?",
                "%" + q.toLowerCase() + "%");

        model.addAttribute("query", q);
        model.addAttribute("results", rows);
        return "secure";
    }

    @PostMapping("/secure/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        Model model) {
        String failMessage = "Invalid username or password.";

        if (!Validator.isValidUsername(username)) {
            model.addAttribute("loginError", failMessage);
            return "secure";
        }

        try {
            List<String> hashes = jdbc.queryForList(
                    "SELECT password_hash FROM users WHERE username = ?",
                    String.class, username);

            if (!hashes.isEmpty() && encoder.matches(password, hashes.get(0))) {
                model.addAttribute("loginResult", "Login successful.");
            } else {
                model.addAttribute("loginError", failMessage);
            }
        } catch (DataAccessException e) {
            model.addAttribute("loginError", "Something went wrong. Please try again later.");
        }
        return "secure";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String username,
                           @RequestParam String password,
                           @RequestParam String confirm,
                           Model model) {
        if (!Validator.isValidUsername(username)) {
            model.addAttribute("error",
                    "Username must be 4 to 20 characters: letters, numbers or underscore.");
            return "register";
        }

        String problem = Validator.passwordError(password, confirm);
        if (problem != null) {
            model.addAttribute("error", problem);
            return "register";
        }

        try {
            String hash = encoder.encode(password);
            jdbc.update("INSERT INTO users (username, password_hash) VALUES (?, ?)",
                    username, hash);
            model.addAttribute("success", "Account created. You can now log in on the secure page.");
        } catch (DuplicateKeyException e) {
            model.addAttribute("error", "That username is not available.");
        } catch (DataAccessException e) {
            model.addAttribute("error", "Something went wrong. Please try again later.");
        }
        return "register";
    }
}
