package com.fixmyroom.auth;

import java.util.UUID;

public record EmployeeProfileResponse(
        UUID id,
        UUID businessId,
        UUID managerId,
        String businessName,
        String name,
        EmployeeRole role,
        String languagePreference,
        String phone,
        String email,
        String propertyType,
        String preferredCurrency
) {
    static EmployeeProfileResponse from(EmployeeRecord employee) {
        return new EmployeeProfileResponse(
                employee.id(),
                employee.businessId(),
                employee.managerId(),
                employee.businessName(),
                employee.name(),
                employee.role(),
                employee.languagePreference(),
                employee.phone(),
                employee.email(),
                employee.propertyType(),
                employee.preferredCurrency()
        );
    }
}
