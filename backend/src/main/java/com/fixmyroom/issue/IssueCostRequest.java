package com.fixmyroom.issue;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record IssueCostRequest(
        @PositiveOrZero BigDecimal estimatedCost,
        @PositiveOrZero BigDecimal materialCost,
        @PositiveOrZero BigDecimal laborCost,
        @PositiveOrZero BigDecimal otherCost,
        @Size(max = 500) String costNotes
) {}
