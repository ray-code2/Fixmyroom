package com.fixmyroom.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Manager-initiated reset for a staff/technician's password — no token; the manager is already authenticated. */
public record EmployeeResetPasswordRequest(
        @NotBlank @Size(min = 8) String newPassword
) {}
