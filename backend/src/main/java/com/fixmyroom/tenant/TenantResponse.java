package com.fixmyroom.tenant;

import java.time.LocalDate;
import java.util.UUID;

public record TenantResponse(
        UUID id,
        UUID businessId,
        String roomId,
        String unitNumber,
        String name,
        String phone,
        String email,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        boolean active,
        String notes
) {
    static TenantResponse from(TenantRecord t) {
        return new TenantResponse(
                t.id(),
                t.businessId(),
                t.roomId() != null ? t.roomId().toString() : null,
                t.unitNumber(),
                t.name(),
                t.phone(),
                t.email(),
                t.checkInDate(),
                t.checkOutDate(),
                t.active(),
                t.notes()
        );
    }
}
