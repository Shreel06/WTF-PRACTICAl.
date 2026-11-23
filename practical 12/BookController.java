package com.library;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class BookController {

    private static final int MAX_LOANS = 3;

    private final JdbcTemplate jdbc;

    private final RowMapper<Map<String, Object>> bookMapper = (rs, i) -> {
        Map<String, Object> book = new LinkedHashMap<>();
        book.put("id", rs.getInt("id"));
        book.put("title", rs.getString("title"));
        book.put("author", rs.getString("author"));
        book.put("category", rs.getString("category"));
        book.put("available_copies", rs.getInt("available_copies"));
        book.put("total_copies", rs.getInt("total_copies"));
        return book;
    };

    private final RowMapper<Map<String, Object>> loanMapper = (rs, i) -> {
        Map<String, Object> loan = new LinkedHashMap<>();
        loan.put("id", rs.getInt("id"));
        loan.put("title", rs.getString("title"));
        loan.put("author", rs.getString("author"));
        loan.put("borrowed_on", rs.getDate("borrowed_on").toString());
        return loan;
    };

    public BookController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record BookRequest(String title, String author, String category, Integer copies) {
    }

    private ResponseEntity<?> loginRequired() {
        return Responses.message(HttpStatus.UNAUTHORIZED, "Please log in first.");
    }

    @GetMapping("/api/books")
    public ResponseEntity<?> list(@RequestParam(defaultValue = "") String q, HttpServletRequest request) {
        if (Access.userId(request) == null) {
            return loginRequired();
        }
        if (!Validator.isValidSearch(q)) {
            return Responses.message(HttpStatus.BAD_REQUEST,
                    "Search can only contain letters, numbers and spaces (maximum 50).");
        }
        String like = "%" + q.toLowerCase() + "%";
        List<Map<String, Object>> books = jdbc.query(
                "SELECT id, title, author, category, available_copies, total_copies FROM books "
                        + "WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(category) LIKE ? "
                        + "ORDER BY title",
                bookMapper, like, like, like);
        return ResponseEntity.ok(books);
    }

    @PostMapping("/api/books")
    public ResponseEntity<?> add(@RequestBody BookRequest req, HttpServletRequest request) {
        if (Access.userId(request) == null) {
            return loginRequired();
        }
        if (!Access.isAdmin(request)) {
            return Responses.message(HttpStatus.FORBIDDEN, "Only the admin can add books.");
        }
        String problem = Validator.bookError(req.title(), req.author(), req.category(), req.copies());
        if (problem != null) {
            return Responses.message(HttpStatus.BAD_REQUEST, problem);
        }
        jdbc.update("INSERT INTO books (title, author, category, total_copies, available_copies) VALUES (?, ?, ?, ?, ?)",
                req.title().trim(), req.author().trim(), req.category().trim(), req.copies(), req.copies());
        return Responses.message(HttpStatus.CREATED, "Book added.");
    }

    @DeleteMapping("/api/books/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
        if (Access.userId(request) == null) {
            return loginRequired();
        }
        if (!Access.isAdmin(request)) {
            return Responses.message(HttpStatus.FORBIDDEN, "Only the admin can delete books.");
        }
        Integer active = jdbc.queryForObject(
                "SELECT COUNT(*) FROM loans WHERE book_id = ? AND returned_on IS NULL", Integer.class, id);
        if (active != null && active > 0) {
            return Responses.message(HttpStatus.CONFLICT, "This book is currently borrowed.");
        }
        int rows = jdbc.update("DELETE FROM books WHERE id = ?", id);
        if (rows == 0) {
            return Responses.message(HttpStatus.NOT_FOUND, "Book not found.");
        }
        return Responses.message(HttpStatus.OK, "Book deleted.");
    }

    @Transactional
    @PostMapping("/api/books/{id}/borrow")
    public ResponseEntity<?> borrow(@PathVariable int id, HttpServletRequest request) {
        Integer userId = Access.userId(request);
        if (userId == null) {
            return loginRequired();
        }

        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM books WHERE id = ?", Integer.class, id);
        if (exists == null || exists == 0) {
            return Responses.message(HttpStatus.NOT_FOUND, "Book not found.");
        }

        Integer already = jdbc.queryForObject(
                "SELECT COUNT(*) FROM loans WHERE user_id = ? AND book_id = ? AND returned_on IS NULL",
                Integer.class, userId, id);
        if (already != null && already > 0) {
            return Responses.message(HttpStatus.CONFLICT, "You have already borrowed this book.");
        }

        Integer current = jdbc.queryForObject(
                "SELECT COUNT(*) FROM loans WHERE user_id = ? AND returned_on IS NULL", Integer.class, userId);
        if (current != null && current >= MAX_LOANS) {
            return Responses.message(HttpStatus.CONFLICT, "You can borrow only " + MAX_LOANS + " books at a time.");
        }

        int updated = jdbc.update(
                "UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0", id);
        if (updated == 0) {
            return Responses.message(HttpStatus.CONFLICT, "No copies are available right now.");
        }

        jdbc.update("INSERT INTO loans (user_id, book_id, borrowed_on) VALUES (?, ?, CURRENT_DATE)", userId, id);
        return Responses.message(HttpStatus.OK, "Book borrowed successfully.");
    }

    @Transactional
    @PostMapping("/api/books/{id}/return")
    public ResponseEntity<?> giveBack(@PathVariable int id, HttpServletRequest request) {
        Integer userId = Access.userId(request);
        if (userId == null) {
            return loginRequired();
        }

        int updated = jdbc.update(
                "UPDATE loans SET returned_on = CURRENT_DATE WHERE user_id = ? AND book_id = ? AND returned_on IS NULL",
                userId, id);
        if (updated == 0) {
            return Responses.message(HttpStatus.BAD_REQUEST, "You have not borrowed this book.");
        }

        jdbc.update("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", id);
        return Responses.message(HttpStatus.OK, "Book returned successfully.");
    }

    @GetMapping("/api/my-books")
    public ResponseEntity<?> myBooks(HttpServletRequest request) {
        Integer userId = Access.userId(request);
        if (userId == null) {
            return loginRequired();
        }
        List<Map<String, Object>> loans = jdbc.query(
                "SELECT b.id, b.title, b.author, l.borrowed_on FROM loans l "
                        + "JOIN books b ON b.id = l.book_id "
                        + "WHERE l.user_id = ? AND l.returned_on IS NULL ORDER BY l.borrowed_on",
                loanMapper, userId);
        return ResponseEntity.ok(loans);
    }
}
