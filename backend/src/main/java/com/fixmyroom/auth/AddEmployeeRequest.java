package com.fixmyroom.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddEmployeeRequest(
        @NotBlank @Size(max = 50)  String name,
        @NotNull                   EmployeeRole role,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 30)            String phone
) {}
