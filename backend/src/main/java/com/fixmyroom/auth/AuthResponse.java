package com.fixmyroom.auth;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        EmployeeProfileResponse employee
) {
}
