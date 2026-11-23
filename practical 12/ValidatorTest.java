package com.library;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ValidatorTest {

    @Test
    void validUsernameIsAccepted() {
        assertTrue(Validator.isValidUsername("rahul_01"));
    }

    @Test
    void badUsernamesAreRejected() {
        assertFalse(Validator.isValidUsername("ab"));
        assertFalse(Validator.isValidUsername("admin' --"));
        assertFalse(Validator.isValidUsername(null));
    }

    @Test
    void scriptTagIsRejectedInSearch() {
        assertFalse(Validator.isValidSearch("<script>alert(1)</script>"));
        assertTrue(Validator.isValidSearch("clean code"));
    }

    @Test
    void strongPasswordPasses() {
        assertNull(Validator.passwordError("Strong@123", "Strong@123"));
    }

    @Test
    void weakPasswordsFail() {
        assertNotNull(Validator.passwordError("short", "short"));
        assertNotNull(Validator.passwordError("alllowercase1!", "alllowercase1!"));
        assertNotNull(Validator.passwordError("NoSpecial123", "NoSpecial123"));
    }

    @Test
    void mismatchedConfirmFails() {
        assertNotNull(Validator.passwordError("Strong@123", "Strong@124"));
    }

    @Test
    void bookValidation() {
        assertNull(Validator.bookError("Clean Code", "Robert Martin", "Programming", 2));
        assertNotNull(Validator.bookError("<b>Hack</b>", "Robert Martin", "Programming", 2));
        assertNotNull(Validator.bookError("Clean Code", "Robert Martin", "Programming", 0));
    }
}
