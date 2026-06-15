package com.fixmyroom.leads;

public record LeadExportRow(
        String fullName,
        String role,
        String propertyName,
        String propertyType,
        String email,
        String phone,
        int roomCount,
        String leadType,
        String notes,
        String submittedAt
) {}
