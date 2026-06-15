package com.fixmyroom.leads;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record LeadRequest(
        @NotBlank(message = "Full name is required.")
        @Size(max = 50, message = "Full name must be 50 characters or fewer.")
        String fullName,

        @Size(max = 50, message = "Role must be 50 characters or fewer.")
        String role,

        @NotBlank(message = "Property name is required.")
        @Size(max = 80, message = "Property name must be 80 characters or fewer.")
        String propertyName,

        @NotNull(message = "Property type is required.")
        PropertyType propertyType,

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        @Size(max = 120, message = "Email must be 120 characters or fewer.")
        String email,

        @Size(max = 30, message = "Phone must be 30 characters or fewer.")
        @Pattern(regexp = "^$|^[+0-9 ()-]{7,30}$", message = "Phone can contain digits, spaces, +, -, and parentheses only.")
        String phone,

        @NotNull(message = "Room count is required.")
        @Min(value = 1, message = "Room count must be at least 1.")
        @Max(value = 10000, message = "Room count cannot exceed 10,000.")
        Integer roomCount,

        @NotNull(message = "Lead type is required.")
        LeadType leadType,

        @Size(max = 280, message = "Notes must be 280 characters or fewer.")
        String notes,

        @NotBlank(message = "Source is required.")
        @Pattern(regexp = "^landing_page$", message = "Source must be landing_page.")
        String source,

        @NotNull(message = "Submitted timestamp is required.")
        @PastOrPresent(message = "Submitted timestamp cannot be in the future.")
        Instant submittedAt
) {
}
