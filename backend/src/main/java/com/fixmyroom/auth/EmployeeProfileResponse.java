package com.fixmyroom.auth;

import java.util.UUID;

public record EmployeeProfileResponse(
        UUID id,
        UUID hotelId,
        UUID managerId,
        String hotelName,
        String name,
        EmployeeRole role,
        String languagePreference,
        String phone,
        String email
) {
    static EmployeeProfileResponse from(EmployeeRecord employee) {
        return new EmployeeProfileResponse(
                employee.id(),
                employee.hotelId(),
                employee.managerId(),
                employee.hotelName(),
                employee.name(),
                employee.role(),
                employee.languagePreference(),
                employee.phone(),
                employee.email()
        );
    }
}
