package com.fixmyroom.revenue;

import com.fixmyroom.common.JwtTenant;
import com.fixmyroom.issue.IssueRepository;
import com.fixmyroom.rent.RentPaymentRecord;
import com.fixmyroom.rent.RentPaymentRepository;
import com.fixmyroom.rent.RentPaymentStatus;
import com.fixmyroom.room.RoomRecord;
import com.fixmyroom.room.RoomRepository;
import com.fixmyroom.tenant.TenantRecord;
import com.fixmyroom.tenant.TenantRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/revenue")
@PreAuthorize("hasRole('MANAGER')")
public class RevenueController {

    private final RentPaymentRepository rentRepo;
    private final TenantRepository tenantRepo;
    private final RoomRepository roomRepo;
    private final IssueRepository issueRepo;

    public RevenueController(RentPaymentRepository rentRepo,
                             TenantRepository tenantRepo,
                             RoomRepository roomRepo,
                             IssueRepository issueRepo) {
        this.rentRepo = rentRepo;
        this.tenantRepo = tenantRepo;
        this.roomRepo = roomRepo;
        this.issueRepo = issueRepo;
    }

    @GetMapping("/dashboard")
    public RevenueDashboardResponse dashboard(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal Jwt jwt) {

        UUID businessId = JwtTenant.businessId(jwt);
        YearMonth period = (year != null && month != null)
                ? YearMonth.of(year, month)
                : YearMonth.now();

        // ── Load data ──────────────────────────────────────────────────────────
        List<RentPaymentRecord> payments = rentRepo.findByBusiness(
                businessId, period.getYear(), period.getMonthValue());
        List<TenantRecord> tenants = tenantRepo.findActiveByBusiness(businessId);
        List<RoomRecord> rooms = roomRepo.findActiveByProperty(businessId);

        // Maintenance: approved costs in this calendar month
        LocalDate monthStart = period.atDay(1);
        LocalDate monthEnd = period.atEndOfMonth();
        IssueRepository.FinanceAggregates maint = issueRepo.getFinanceAggregates(
                businessId,
                monthStart.atStartOfDay(java.time.ZoneOffset.UTC).toInstant(),
                monthEnd.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant());

        // ── Rent aggregates ────────────────────────────────────────────────────
        BigDecimal expectedRent = BigDecimal.ZERO;
        BigDecimal collectedRent = BigDecimal.ZERO;
        BigDecimal unpaidRent = BigDecimal.ZERO;
        BigDecimal partialBalance = BigDecimal.ZERO;
        int unpaidCount = 0;
        int partialCount = 0;

        for (RentPaymentRecord p : payments) {
            expectedRent = expectedRent.add(p.amountDue());
            BigDecimal paid = p.amountPaid() != null ? p.amountPaid() : BigDecimal.ZERO;
            collectedRent = collectedRent.add(paid);
            if (p.status() == RentPaymentStatus.UNPAID) {
                unpaidRent = unpaidRent.add(p.amountDue());
                unpaidCount++;
            } else if (p.status() == RentPaymentStatus.PARTIAL) {
                partialBalance = partialBalance.add(p.amountDue().subtract(paid));
                partialCount++;
            }
        }

        // ── Vacancy loss ───────────────────────────────────────────────────────
        LocalDate today = LocalDate.now();
        BigDecimal vacancyLoss = BigDecimal.ZERO;
        int vacantUnits = 0;
        long maxVacancyDays = 0;

        for (RoomRecord r : rooms) {
            if (r.vacancyStart() == null) continue;
            LocalDate start = r.vacancyStart();
            long days = ChronoUnit.DAYS.between(start, today);
            if (days <= 0) continue;
            vacantUnits++;
            maxVacancyDays = Math.max(maxVacancyDays, days);
            BigDecimal ratePerDay = r.vacancyRatePerDay() != null
                    ? r.vacancyRatePerDay()
                    : (r.monthlyRent() != null ? r.monthlyRent().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            vacancyLoss = vacancyLoss.add(ratePerDay.multiply(BigDecimal.valueOf(days)));
        }

        // ── Maintenance totals ─────────────────────────────────────────────────
        BigDecimal maintApproved = maint.totalApproved() != null ? maint.totalApproved() : BigDecimal.ZERO;
        BigDecimal maintPending = (maint.totalEstimated() != null ? maint.totalEstimated() : BigDecimal.ZERO)
                .subtract(maintApproved);
        if (maintPending.compareTo(BigDecimal.ZERO) < 0) maintPending = BigDecimal.ZERO;

        // ── Net revenue ────────────────────────────────────────────────────────
        BigDecimal net = collectedRent.subtract(maintApproved).subtract(vacancyLoss);

        // ── Per-unit summaries ─────────────────────────────────────────────────
        Map<String, List<RentPaymentRecord>> byUnit = payments.stream()
                .filter(p -> p.unitNumber() != null)
                .collect(Collectors.groupingBy(RentPaymentRecord::unitNumber));

        List<RevenueDashboardResponse.UnitSummary> unitSummaries = new ArrayList<>();
        for (RoomRecord room : rooms) {
            String unitNum = room.unitNumber();
            List<RentPaymentRecord> unitPayments = byUnit.getOrDefault(unitNum, List.of());

            BigDecimal uExpected = unitPayments.stream().map(RentPaymentRecord::amountDue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal uCollected = unitPayments.stream()
                    .map(p -> p.amountPaid() != null ? p.amountPaid() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal uBalance = uExpected.subtract(uCollected);

            String rentStatus = "NO_DATA";
            if (room.vacancyStart() != null) {
                rentStatus = "VACANT";
            } else if (!unitPayments.isEmpty()) {
                boolean allPaid = unitPayments.stream().allMatch(p -> p.status() == RentPaymentStatus.PAID);
                boolean anyPartial = unitPayments.stream().anyMatch(p -> p.status() == RentPaymentStatus.PARTIAL);
                rentStatus = allPaid ? "PAID" : (anyPartial ? "PARTIAL" : "UNPAID");
            }

            // Vacancy for this unit
            long uVacancyDays = 0;
            BigDecimal uVacancyLoss = BigDecimal.ZERO;
            if (room.vacancyStart() != null) {
                uVacancyDays = Math.max(0, ChronoUnit.DAYS.between(room.vacancyStart(), today));
                BigDecimal rate = room.vacancyRatePerDay() != null
                        ? room.vacancyRatePerDay()
                        : (room.monthlyRent() != null ? room.monthlyRent().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
                uVacancyLoss = rate.multiply(BigDecimal.valueOf(uVacancyDays));
            }

            BigDecimal uMaintCost = BigDecimal.ZERO; // could be enriched later with per-room breakdown
            BigDecimal uNet = uCollected.subtract(uMaintCost).subtract(uVacancyLoss);

            unitSummaries.add(new RevenueDashboardResponse.UnitSummary(
                    unitNum, uExpected, uCollected, uBalance, rentStatus,
                    uVacancyDays, uVacancyLoss, uMaintCost, uNet
            ));
        }

        // ── AI Insights ────────────────────────────────────────────────────────
        List<String> insights = generateInsights(
                unpaidCount, partialCount, unpaidRent, partialBalance,
                vacantUnits, maxVacancyDays, vacancyLoss,
                maintApproved, collectedRent, unitSummaries
        );

        return new RevenueDashboardResponse(
                expectedRent, collectedRent, unpaidRent, partialBalance,
                unpaidCount, partialCount,
                vacancyLoss, vacantUnits, maxVacancyDays,
                maintApproved, maintPending,
                net,
                unitSummaries,
                insights,
                "USD" // could be fetched from business settings in future
        );
    }

    // ── Rules-based AI insight engine ─────────────────────────────────────────

    private List<String> generateInsights(
            int unpaidCount, int partialCount,
            BigDecimal unpaidRent, BigDecimal partialBalance,
            int vacantUnits, long maxVacancyDays, BigDecimal vacancyLoss,
            BigDecimal maintCost, BigDecimal collectedRent,
            List<RevenueDashboardResponse.UnitSummary> units) {

        List<String> insights = new ArrayList<>();

        if (unpaidCount > 0) {
            insights.add(String.format(
                    "⚠️ %d unit%s with unpaid rent — %s outstanding this month.",
                    unpaidCount, unpaidCount > 1 ? "s have" : " has",
                    formatAmount(unpaidRent)));
        }

        if (partialCount > 0) {
            insights.add(String.format(
                    "🟡 %d partial payment%s — %s still owed.",
                    partialCount, partialCount > 1 ? "s" : "",
                    formatAmount(partialBalance)));
        }

        if (vacantUnits > 0) {
            insights.add(String.format(
                    "🏚️ %d vacant unit%s — estimated %s lost to vacancy.",
                    vacantUnits, vacantUnits > 1 ? "s" : "",
                    formatAmount(vacancyLoss)));
        }

        if (maxVacancyDays > 14) {
            insights.add(String.format(
                    "🔴 A unit has been vacant for %d days. Consider lowering the asking price or running a promotion.",
                    maxVacancyDays));
        }

        if (collectedRent.compareTo(BigDecimal.ZERO) > 0
                && maintCost.compareTo(collectedRent.multiply(BigDecimal.valueOf(0.3))) > 0) {
            insights.add(String.format(
                    "🔧 Maintenance costs (%s) exceed 30%% of collected rent this month — review vendor spending.",
                    formatAmount(maintCost)));
        }

        if (vacancyLoss.compareTo(maintCost) > 0 && vacancyLoss.compareTo(BigDecimal.ZERO) > 0) {
            insights.add("📉 Vacancy is your biggest revenue leak this month — prioritise filling empty units.");
        }

        // Top losing units
        units.stream()
                .filter(u -> u.netProfit().compareTo(BigDecimal.ZERO) < 0)
                .sorted(Comparator.comparing(RevenueDashboardResponse.UnitSummary::netProfit))
                .limit(3)
                .forEach(u -> insights.add(String.format(
                        "📌 Unit %s is losing money this month (net: %s).",
                        u.unitNumber(), formatAmount(u.netProfit()))));

        if (insights.isEmpty()) {
            insights.add("✅ All units look healthy this month. No revenue leaks detected.");
        }

        return insights;
    }

    private static String formatAmount(BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,.0f", amount.abs().doubleValue());
    }
}
