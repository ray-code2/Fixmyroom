package com.fixmyroom.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 80)  String propertyName,
        @Size(max = 160)           String address,
        @NotBlank @Size(max = 50)  String managerName,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 8, max = 100) String password
) {}
