package com.fixmyroom.issue;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record IssueStatusRequest(
        @NotNull IssueStatus status,
        @Size(max = 280) String note,
        @Positive BigDecimal estimatedCost,
        @Positive BigDecimal actualCost
) {}
