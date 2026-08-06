package com.fixmyroom.revenue;

import java.math.BigDecimal;
import java.util.List;

public record RevenueDashboardResponse(
        // Rent metrics
        BigDecimal expectedRentTotal,
        BigDecimal collectedRentTotal,
        BigDecimal unpaidRentTotal,
        BigDecimal partialRentBalance,
        int unpaidTenantsCount,
        int partialTenantsCount,

        // Vacancy metrics
        BigDecimal vacancyLossTotal,
        int vacantUnitsCount,
        long maxVacancyDays,

        // Maintenance metrics
        BigDecimal maintenanceCostApproved,
        BigDecimal maintenanceCostPending,

        // Profit
        BigDecimal netRevenue,

        // Per-unit breakdown
        List<UnitSummary> unitSummaries,

        // AI insights (plain English)
        List<String> insights,

        String currency
) {
    public record UnitSummary(
            String unitNumber,
            BigDecimal expectedRent,
            BigDecimal collectedRent,
            BigDecimal rentBalance,
            String rentStatus,       // PAID | PARTIAL | UNPAID | VACANT | NO_DATA
            long vacancyDays,
            BigDecimal vacancyLoss,
            BigDecimal maintenanceCost,
            BigDecimal netProfit
    ) {}
}
