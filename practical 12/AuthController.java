package com.library;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int MAX_FAILS = 5;
    private static final long LOCK_MILLIS = 5 * 60 * 1000;

    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final Map<String, Integer> failures = new ConcurrentHashMap<>();
    private final Map<String, Long> lockedUntil = new ConcurrentHashMap<>();

    public AuthController(JdbcTemplate jdbc, PasswordEncoder encoder) {
        this.jdbc = jdbc;
        this.encoder = encoder;
    }

    public record RegisterRequest(String username, String password, String confirm) {
    }

    public record LoginRequest(String username, String password) {
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (!Validator.isValidUsername(req.username())) {
            return Responses.message(HttpStatus.BAD_REQUEST,
                    "Username must be 4 to 20 characters: letters, numbers or underscore.");
        }
        String problem = Validator.passwordError(req.password(), req.confirm());
        if (problem != null) {
            return Responses.message(HttpStatus.BAD_REQUEST, problem);
        }
        try {
            jdbc.update("INSERT INTO users (username, password_hash, user_role) VALUES (?, ?, 'MEMBER')",
                    req.username(), encoder.encode(req.password()));
            return Responses.message(HttpStatus.CREATED, "Account created. Please log in.");
        } catch (DuplicateKeyException e) {
            return Responses.message(HttpStatus.CONFLICT, "That username is not available.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        String username = req.username() == null ? "" : req.username();
        String failMessage = "Invalid username or password.";

        Long until = lockedUntil.get(username);
        if (until != null) {
            if (System.currentTimeMillis() < until) {
                return Responses.message(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many failed attempts. Please try again after 5 minutes.");
            }
            lockedUntil.remove(username);
            failures.remove(username);
        }

        if (!Validator.isValidUsername(username) || req.password() == null) {
            return Responses.message(HttpStatus.UNAUTHORIZED, failMessage);
        }

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id, password_hash, user_role FROM users WHERE username = ?", username);

        if (rows.isEmpty() || !encoder.matches(req.password(), (String) rows.get(0).get("password_hash"))) {
            int count = failures.merge(username, 1, Integer::sum);
            if (count >= MAX_FAILS) {
                lockedUntil.put(username, System.currentTimeMillis() + LOCK_MILLIS);
            }
            return Responses.message(HttpStatus.UNAUTHORIZED, failMessage);
        }

        failures.remove(username);
        String role = (String) rows.get(0).get("user_role");

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", ((Number) rows.get(0).get("id")).intValue());
        session.setAttribute("username", username);
        session.setAttribute("role", role);

        return ResponseEntity.ok(Map.of("username", username, "role", role));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return Responses.message(HttpStatus.OK, "Logged out.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        if (Access.userId(request) == null) {
            return Responses.message(HttpStatus.UNAUTHORIZED, "Please log in first.");
        }
        HttpSession session = request.getSession(false);
        return ResponseEntity.ok(Map.of(
                "username", (String) session.getAttribute("username"),
                "role", (String) session.getAttribute("role")));
    }
}
