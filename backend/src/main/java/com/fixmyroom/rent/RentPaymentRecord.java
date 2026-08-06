package com.fixmyroom.rent;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RentPaymentRecord(
        UUID id,
        UUID tenantId,
        UUID businessId,
        UUID roomId,
        int periodYear,
        int periodMonth,
        LocalDate dueDate,
        LocalDate paidDate,
        BigDecimal amountDue,
        BigDecimal amountPaid,
        String currency,
        RentPaymentStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        // Joined fields
        String tenantName,
        String unitNumber
) {}
