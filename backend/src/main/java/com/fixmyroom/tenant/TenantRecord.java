package com.fixmyroom.tenant;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TenantRecord(
        UUID id,
        UUID businessId,
        UUID roomId,
        String name,
        String phone,
        String email,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        boolean active,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        // Joined from rooms
        String unitNumber
) {}
