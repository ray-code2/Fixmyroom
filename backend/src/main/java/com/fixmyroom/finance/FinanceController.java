package com.fixmyroom.finance;

import com.fixmyroom.issue.CostStatus;
import com.fixmyroom.issue.IssueRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("hasRole('MANAGER')")
public class FinanceController {

    private final IssueRepository issueRepo;

    public FinanceController(IssueRepository issueRepo) {
        this.issueRepo = issueRepo;
    }

    @GetMapping("/summary")
    public FinanceSummaryResponse summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = propertyId(jwt);
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        IssueRepository.FinanceAggregates agg = issueRepo.getFinanceAggregates(propertyId, fromInstant, toInstant);
        return new FinanceSummaryResponse(
                agg.totalEstimated(),
                agg.totalActual(),
                agg.totalApproved(),
                agg.pendingCount(),
                agg.issuesWithCost()
        );
    }

    @GetMapping("/issues")
    public List<FinanceRowResponse> issues(
            @RequestParam(required = false) CostStatus costStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        return issueRepo.findForFinanceTable(propertyId(jwt), costStatus, fromInstant, toInstant)
                .stream()
                .map(FinanceRowResponse::from)
                .toList();
    }

    @GetMapping(value = "/export", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<String> export(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        List<FinanceRowResponse> rows = issueRepo
                .findForFinanceTable(propertyId(jwt), null, fromInstant, toInstant)
                .stream().map(FinanceRowResponse::from).toList();

        StringBuilder csv = new StringBuilder();
        csv.append("Title,Unit,Assigned To,Estimated,Material,Labour,Other,Total Actual,Cost Notes,Cost Status,Created At,Approved At\n");
        for (FinanceRowResponse row : rows) {
            csv.append(esc(row.title())).append(',')
               .append(esc(row.unitNumber())).append(',')
               .append(esc(row.assignedToName())).append(',')
               .append(dec(row.estimatedCost())).append(',')
               .append(dec(row.materialCost())).append(',')
               .append(dec(row.laborCost())).append(',')
               .append(dec(row.otherCost())).append(',')
               .append(dec(row.actualTotal())).append(',')
               .append(esc(row.costNotes())).append(',')
               .append(row.costStatus() != null ? row.costStatus().name() : "").append(',')
               .append(row.createdAt() != null ? row.createdAt().toString() : "").append(',')
               .append(row.costApprovedAt() != null ? row.costApprovedAt().toString() : "")
               .append('\n');
        }

        String range = (from != null ? "-" + from : "") + (to != null ? "-to-" + to : "");
        String filename = "finance-report" + range + ".csv";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(csv.toString());
    }

    private static String esc(String v) {
        if (v == null || v.isEmpty()) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n"))
            return "\"" + v.replace("\"", "\"\"") + "\"";
        return v;
    }

    private static String dec(BigDecimal v) {
        return v != null ? v.toPlainString() : "";
    }

    private UUID propertyId(Jwt jwt) {
        return UUID.fromString(jwt.getClaimAsString("hotel_id"));
    }
}
