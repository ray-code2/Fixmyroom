package com.fixmyroom.auth;

import java.util.UUID;

public record EmployeeRecord(
        UUID id,
        UUID businessId,
        UUID managerId,
        String businessName,
        String name,
        EmployeeRole role,
        String languagePreference,
        String phone,
        String email,
        String passwordHash,
        boolean active,
        String propertyType,
        String preferredCurrency
) {
}
