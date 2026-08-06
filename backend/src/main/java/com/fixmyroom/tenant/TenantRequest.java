package com.fixmyroom.tenant;

import java.time.LocalDate;

public record TenantRequest(
        String roomId,
        String name,
        String phone,
        String email,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        String notes
) {}
