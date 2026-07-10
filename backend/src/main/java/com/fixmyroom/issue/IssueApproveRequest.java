package com.fixmyroom.issue;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record IssueApproveRequest(
        @PositiveOrZero BigDecimal estimatedCost,
        @Size(max = 280) String note
) {
    public static IssueApproveRequest empty() {
        return new IssueApproveRequest(null, null);
    }
}
