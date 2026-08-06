package com.fixmyroom.rent;

import java.time.LocalDate;

public record RentPaymentRequest(
        String tenantId,
        String roomId,
        int periodYear,
        int periodMonth,
        LocalDate dueDate,
        LocalDate paidDate,
        double amountDue,
        Double amountPaid,
        /** ISO 4217 code e.g. USD, IDR */
        String currency,
        String notes
) {}
