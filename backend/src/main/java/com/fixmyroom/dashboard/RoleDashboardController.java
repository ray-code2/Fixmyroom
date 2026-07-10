package com.fixmyroom.dashboard;

import com.fixmyroom.auth.EmployeeRepository;
import com.fixmyroom.auth.ManagerContact;
import com.fixmyroom.common.JwtTenant;
import com.fixmyroom.issue.CostStatus;
import com.fixmyroom.issue.IssueRecord;
import com.fixmyroom.issue.IssueRepository;
import com.fixmyroom.issue.IssueStatus;
import com.fixmyroom.issue.IssueSummaryResponse;
import com.fixmyroom.room.RoomRepository;
import com.fixmyroom.room.RoomResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class RoleDashboardController {

    private final IssueRepository issueRepo;
    private final RoomRepository roomRepo;
    private final EmployeeRepository employeeRepo;

    public RoleDashboardController(IssueRepository issueRepo, RoomRepository roomRepo, EmployeeRepository employeeRepo) {
        this.issueRepo = issueRepo;
        this.roomRepo = roomRepo;
        this.employeeRepo = employeeRepo;
    }

    @GetMapping("/staff/dashboard")
    @PreAuthorize("hasRole('STAFF')")
    StaffDashboardResponse staffDashboard(@AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = propertyId(jwt);

        List<RoomResponse> rooms = roomRepo.findActiveByProperty(propertyId)
                .stream().map(RoomResponse::from).limit(5).toList();

        int myReports = issueRepo.findByProperty(propertyId, null, null, null, null).stream()
                .filter(i -> i.reportedById().equals(employeeId(jwt))).toList().size();

        List<ManagerContact> managers = employeeRepo.findActiveManagersByBusiness(propertyId);

        return new StaffDashboardResponse(
                claim(jwt, "name"),
                JwtTenant.businessName(jwt),
                rooms,
                myReports,
                managers,
                List.of("Choose unit", "Describe the problem", "Add a photo (optional)", "Submit — manager is notified instantly"),
                "All submitted reports wait for manager review before any external dispatch."
        );
    }

    @GetMapping("/manager/dashboard")
    @PreAuthorize("hasRole('MANAGER')")
    ManagerDashboardResponse managerDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = propertyId(jwt);
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        // When date range is active, derive all metrics from the same filtered set
        // so every card describes the same population.
        if (fromInstant != null || toInstant != null) {
            List<IssueRecord> rawAll = issueRepo.findByProperty(propertyId, null, null, fromInstant, toInstant);
            List<IssueSummaryResponse> all = rawAll.stream().map(IssueSummaryResponse::from).toList();

            int openIssues   = (int) all.stream().filter(i -> i.status() != IssueStatus.COMPLETED && i.status() != IssueStatus.CANCELLED && i.status() != IssueStatus.DECLINED).count();
            int newIssues    = (int) all.stream().filter(i -> i.status() == IssueStatus.NEW).count();
            int inProgress   = (int) all.stream().filter(i -> i.status() == IssueStatus.IN_PROGRESS).count();
            int waitingParts = (int) all.stream().filter(i -> i.status() == IssueStatus.WAITING_PARTS).count();
            int completed    = (int) all.stream().filter(i -> i.status() == IssueStatus.COMPLETED).count();

            double[] resolvedHours = rawAll.stream()
                    .filter(r -> r.status() == IssueStatus.COMPLETED && r.resolvedAt() != null)
                    .mapToDouble(r -> (r.resolvedAt().toEpochMilli() - r.createdAt().toEpochMilli()) / 3_600_000.0)
                    .toArray();
            Double avgResolutionHours = resolvedHours.length == 0 ? null
                    : java.util.Arrays.stream(resolvedHours).average().getAsDouble();

            BigDecimal costThisMonth = rawAll.stream()
                    .filter(r -> r.costStatus() == CostStatus.APPROVED)
                    .map(r -> computeActualCost(r))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<IssueSummaryResponse> urgent = all.stream()
                    .filter(i -> i.status() != IssueStatus.COMPLETED && i.status() != IssueStatus.CANCELLED && i.status() != IssueStatus.DECLINED)
                    .filter(i -> i.priority().name().equals("URGENT") || i.priority().name().equals("HIGH"))
                    .limit(5).toList();

            return new ManagerDashboardResponse(claim(jwt, "name"), JwtTenant.businessName(jwt),
                    openIssues, newIssues, inProgress, waitingParts, completed,
                    avgResolutionHours, costThisMonth, urgent);
        }

        int openIssues      = issueRepo.countOpenByProperty(propertyId);
        int newIssues       = issueRepo.countByPropertyAndStatus(propertyId, IssueStatus.NEW);
        int inProgress      = issueRepo.countByPropertyAndStatus(propertyId, IssueStatus.IN_PROGRESS);
        int waitingParts    = issueRepo.countByPropertyAndStatus(propertyId, IssueStatus.WAITING_PARTS);
        int completedTotal  = issueRepo.countByPropertyAndStatus(propertyId, IssueStatus.COMPLETED);

        Double avgResolutionHours = issueRepo.getAvgResolutionHours(propertyId, null, null);

        // Default cost window = current calendar month when no date filter is active.
        LocalDate monthStart = LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1);
        Instant monthFrom = monthStart.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant monthTo   = monthStart.plusMonths(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        BigDecimal costThisMonth = issueRepo.getApprovedCostTotal(propertyId, monthFrom, monthTo);

        List<IssueSummaryResponse> urgent = issueRepo.findByProperty(propertyId, null, null, null, null)
                .stream()
                .filter(i -> i.status() != IssueStatus.COMPLETED && i.status() != IssueStatus.CANCELLED && i.status() != IssueStatus.DECLINED)
                .filter(i -> i.priority().name().equals("URGENT") || i.priority().name().equals("HIGH"))
                .limit(5)
                .map(IssueSummaryResponse::from)
                .toList();

        return new ManagerDashboardResponse(
                claim(jwt, "name"),
                JwtTenant.businessName(jwt),
                openIssues, newIssues, inProgress, waitingParts, completedTotal,
                avgResolutionHours, costThisMonth, urgent
        );
    }

    @GetMapping("/technician/dashboard")
    @PreAuthorize("hasRole('TECHNICIAN')")
    TechnicianDashboardResponse technicianDashboard(@AuthenticationPrincipal Jwt jwt) {
        UUID propertyId  = propertyId(jwt);
        UUID techId      = employeeId(jwt);

        List<IssueSummaryResponse> assigned = issueRepo.findByProperty(propertyId, null, techId, null, null)
                .stream().map(IssueSummaryResponse::from).toList();

        int inProgress   = (int) assigned.stream()
                .filter(i -> i.status() == IssueStatus.IN_PROGRESS).count();
        int waitingParts = (int) assigned.stream()
                .filter(i -> i.status() == IssueStatus.WAITING_PARTS).count();

        return new TechnicianDashboardResponse(
                claim(jwt, "name"),
                JwtTenant.businessName(jwt),
                assigned.size(),
                inProgress,
                waitingParts,
                assigned.stream().limit(5).toList(),
                List.of("Open the issue to see full details and photos",
                        "Update status as you work: In Progress → Waiting Parts → Completed",
                        "Add a note when blocked or waiting",
                        "Mark Completed to notify the manager")
        );
    }

    private UUID propertyId(Jwt jwt) {
        return JwtTenant.businessId(jwt);
    }

    private UUID employeeId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    private String claim(Jwt jwt, String name) {
        Object v = jwt.getClaims().get(name);
        return v == null ? "" : v.toString();
    }

    private static BigDecimal computeActualCost(IssueRecord r) {
        if (r.materialCost() != null) {
            return r.materialCost()
                    .add(r.laborCost()  != null ? r.laborCost()  : BigDecimal.ZERO)
                    .add(r.otherCost()  != null ? r.otherCost()  : BigDecimal.ZERO);
        }
        return r.actualCost() != null ? r.actualCost() : BigDecimal.ZERO;
    }

    // --- Response records ---

    public record StaffDashboardResponse(
            String employeeName,
            String propertyName,
            List<RoomResponse> quickUnits,
            int myReportCount,
            List<ManagerContact> managers,
            List<String> reportSteps,
            String approvalRule
    ) {}

    public record ManagerDashboardResponse(
            String employeeName,
            String propertyName,
            int openIssues,
            int newIssues,
            int inProgress,
            int waitingParts,
            int completedTotal,
            Double avgResolutionHours,
            BigDecimal costThisMonth,
            List<IssueSummaryResponse> urgentIssues
    ) {}

    public record TechnicianDashboardResponse(
            String employeeName,
            String propertyName,
            int assignedCount,
            int inProgressCount,
            int waitingPartsCount,
            List<IssueSummaryResponse> queue,
            List<String> technicianActions
    ) {}
}
