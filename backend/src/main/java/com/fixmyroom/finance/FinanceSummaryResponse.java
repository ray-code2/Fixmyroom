package com.fixmyroom.finance;

import java.math.BigDecimal;

public record FinanceSummaryResponse(
        BigDecimal totalEstimated,
        BigDecimal totalActual,
        BigDecimal totalApproved,
        int pendingApprovals,
        int issuesWithCost
) {}
