package com.finsecure.portal;

public class Validator {

    public static boolean isValidSearch(String text) {
        return text != null && text.matches("[A-Za-z0-9 ]{0,50}");
    }

    public static boolean isValidUsername(String username) {
        return username != null && username.matches("[A-Za-z0-9_]{4,20}");
    }

    public static String passwordError(String password, String confirm) {
        if (password == null || password.length() < 8) {
            return "Password must be at least 8 characters long.";
        }
        if (password.length() > 64) {
            return "Password must not be longer than 64 characters.";
        }
        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain an uppercase letter.";
        }
        if (!password.matches(".*[a-z].*")) {
            return "Password must contain a lowercase letter.";
        }
        if (!password.matches(".*[0-9].*")) {
            return "Password must contain a digit.";
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            return "Password must contain a special character.";
        }
        if (!password.equals(confirm)) {
            return "Password and confirm password do not match.";
        }
        return null;
    }
}
