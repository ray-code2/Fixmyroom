package com.fixmyroom.room;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RoomResponse(UUID id, String unitNumber, String floor, String unitType,
                           BigDecimal monthlyRent, BigDecimal vacancyRatePerDay, LocalDate vacancyStart) {

    public static RoomResponse from(RoomRecord r) {
        return new RoomResponse(r.id(), r.unitNumber(), r.floor(), r.unitType(),
                r.monthlyRent(), r.vacancyRatePerDay(), r.vacancyStart());
    }
}
