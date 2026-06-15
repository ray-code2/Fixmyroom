package com.fixmyroom.auth;

import java.util.UUID;

public record EmployeeRecord(
        UUID id,
        UUID hotelId,
        UUID managerId,
        String hotelName,
        String name,
        EmployeeRole role,
        String languagePreference,
        String phone,
        String email,
        String passwordHash,
        boolean active
) {
}
