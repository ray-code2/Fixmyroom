package com.fixmyroom.room;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RoomRecord(
        UUID id,
        UUID propertyId,
        String unitNumber,
        String floor,
        String unitType,
        boolean active,
        Instant createdAt,
        BigDecimal monthlyRent,
        BigDecimal vacancyRatePerDay,
        LocalDate vacancyStart
) {}

