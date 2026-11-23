package com.finsecure.portal;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class VulnerableController {

    private final JdbcTemplate jdbc;

    public VulnerableController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/vulnerable")
    public String page() {
        return "vulnerable";
    }

    @GetMapping("/vulnerable/search")
    public String search(@RequestParam(defaultValue = "") String q, Model model) {
        model.addAttribute("query", q);
        return "vulnerable";
    }

    @PostMapping("/vulnerable/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        Model model) {
        String sql = "SELECT username FROM vuln_users WHERE username = '"
                + username + "' AND password = '" + password + "'";
        model.addAttribute("sql", sql);

        try {
            List<Map<String, Object>> rows = jdbc.queryForList(sql);
            if (rows.isEmpty()) {
                model.addAttribute("loginResult", "Login failed.");
            } else {
                model.addAttribute("loginResult",
                        "Login successful as " + rows.get(0).get("USERNAME"));
            }
        } catch (Exception e) {
            model.addAttribute("loginError", e.getMessage());
        }
        return "vulnerable";
    }
}
