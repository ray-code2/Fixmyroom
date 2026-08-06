package com.fixmyroom.room;

import java.time.LocalDate;

public record RoomRevenueRequest(
        Double monthlyRent,
        Double vacancyRatePerDay,
        LocalDate vacancyStart
) {}
