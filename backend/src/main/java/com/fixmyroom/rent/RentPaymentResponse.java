package com.fixmyroom.rent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RentPaymentResponse(
        UUID id,
        UUID tenantId,
        String tenantName,
        String roomId,
        String unitNumber,
        int periodYear,
        int periodMonth,
        LocalDate dueDate,
        LocalDate paidDate,
        BigDecimal amountDue,
        BigDecimal amountPaid,
        BigDecimal balance,
        String currency,
        String status,
        String notes
) {
    static RentPaymentResponse from(RentPaymentRecord r) {
        BigDecimal paid = r.amountPaid() != null ? r.amountPaid() : BigDecimal.ZERO;
        BigDecimal balance = r.amountDue().subtract(paid);
        return new RentPaymentResponse(
                r.id(),
                r.tenantId(),
                r.tenantName(),
                r.roomId() != null ? r.roomId().toString() : null,
                r.unitNumber(),
                r.periodYear(),
                r.periodMonth(),
                r.dueDate(),
                r.paidDate(),
                r.amountDue(),
                paid,
                balance,
                r.currency(),
                r.status().name(),
                r.notes()
        );
    }
}
