package com.library;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final String adminPassword;

    public DataSeeder(JdbcTemplate jdbc, PasswordEncoder encoder,
                      @Value("${app.admin.password}") String adminPassword) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        Integer admins = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE username = ?", Integer.class, "admin");
        if (admins != null && admins == 0) {
            jdbc.update("INSERT INTO users (username, password_hash, user_role) VALUES (?, ?, 'ADMIN')",
                    "admin", encoder.encode(adminPassword));
        }

        Integer books = jdbc.queryForObject("SELECT COUNT(*) FROM books", Integer.class);
        if (books != null && books == 0) {
            addBook("Wings of Fire", "A P J Abdul Kalam", "Biography", 3);
            addBook("The Alchemist", "Paulo Coelho", "Fiction", 2);
            addBook("Let Us C", "Yashavant Kanetkar", "Programming", 4);
            addBook("Clean Code", "Robert Martin", "Programming", 2);
            addBook("Discovery of India", "Jawaharlal Nehru", "History", 2);
            addBook("Atomic Habits", "James Clear", "Self Help", 3);
        }
    }

    private void addBook(String title, String author, String category, int copies) {
        jdbc.update("INSERT INTO books (title, author, category, total_copies, available_copies) VALUES (?, ?, ?, ?, ?)",
                title, author, category, copies, copies);
    }
}
