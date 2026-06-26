package com.fixmyroom.finance;

import com.fixmyroom.common.JwtTenant;
import com.fixmyroom.issue.CostStatus;
import com.fixmyroom.issue.IssueRecord;
import com.fixmyroom.issue.IssueRepository;
import com.fixmyroom.issue.IssueStatus;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

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

    @GetMapping(value = "/export",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {

        UUID propertyId = propertyId(jwt);
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        List<FinanceRowResponse> rows = issueRepo
                .findForFinanceTable(propertyId, null, fromInstant, toInstant)
                .stream().map(FinanceRowResponse::from).toList();

        // Sheet 2 needs all non-cancelled issues in the same date window.
        List<IssueRecord> allNonCancelled = issueRepo
                .findByProperty(propertyId, null, null, fromInstant, toInstant)
                .stream()
                .filter(r -> r.status() != IssueStatus.CANCELLED)
                .toList();

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFFont bold = wb.createFont();
            bold.setBold(true);
            XSSFCellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);

            // ── Sheet 1: per-issue finance detail ──────────────────────────────
            XSSFSheet sheet1 = wb.createSheet("Finance Report");

            String[] headers = {
                "Title", "Unit", "Assigned To", "Estimated", "Material",
                "Labour", "Other", "Total Actual", "Cost Notes",
                "Cost Status", "Created At", "Approved At", "Hours Out of Service"
            };
            Row headerRow = sheet1.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (FinanceRowResponse row : rows) {
                Row dr = sheet1.createRow(rowNum++);
                dr.createCell(0).setCellValue(nvl(row.title()));
                dr.createCell(1).setCellValue(nvl(row.unitNumber()));
                dr.createCell(2).setCellValue(nvl(row.assignedToName()));
                setNum(dr.createCell(3), row.estimatedCost());
                setNum(dr.createCell(4), row.materialCost());
                setNum(dr.createCell(5), row.laborCost());
                setNum(dr.createCell(6), row.otherCost());
                setNum(dr.createCell(7), row.actualTotal());
                dr.createCell(8).setCellValue(nvl(row.costNotes()));
                dr.createCell(9).setCellValue(row.costStatus() != null ? row.costStatus().name() : "");
                dr.createCell(10).setCellValue(row.createdAt() != null ? row.createdAt().toString() : "");
                dr.createCell(11).setCellValue(row.costApprovedAt() != null ? row.costApprovedAt().toString() : "");
                // null for CANCELLED; live NOW()-createdAt for open; final for COMPLETED
                if (row.hoursOutOfService() != null) {
                    dr.createCell(12).setCellValue(Math.round(row.hoursOutOfService() * 10) / 10.0);
                } else {
                    dr.createCell(12).setCellValue("");
                }
            }

            for (int i = 0; i < headers.length; i++) sheet1.autoSizeColumn(i);

            // ── Sheet 2: by-room rollup ─────────────────────────────────────────
            XSSFSheet sheet2 = wb.createSheet("By Room");

            String[] roomHeaders = {"Room", "Issues", "Approved Cost", "Pending Cost", "Hours Out of Service"};
            Row roomHeaderRow = sheet2.createRow(0);
            for (int i = 0; i < roomHeaders.length; i++) {
                Cell cell = roomHeaderRow.createCell(i);
                cell.setCellValue(roomHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            // Group by human-readable room label (unitNumber from rooms JOIN, or "No Unit").
            Map<String, List<IssueRecord>> byRoom = new LinkedHashMap<>();
            for (IssueRecord r : allNonCancelled) {
                String key = r.unitNumber() != null ? "Unit " + r.unitNumber() : "(No Unit)";
                byRoom.computeIfAbsent(key, k -> new ArrayList<>()).add(r);
            }
            List<String> sortedRooms = new ArrayList<>(byRoom.keySet());
            Collections.sort(sortedRooms);

            int roomRowNum = 1;
            for (String room : sortedRooms) {
                List<IssueRecord> roomIssues = byRoom.get(room);

                BigDecimal approvedCost = roomIssues.stream()
                        .filter(r -> r.costStatus() == CostStatus.APPROVED)
                        .map(FinanceController::actualCost)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal pendingCost = roomIssues.stream()
                        .filter(r -> r.costStatus() == CostStatus.SUBMITTED)
                        .map(FinanceController::actualCost)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                double totalHours = roomIssues.stream()
                        .mapToDouble(r -> r.hoursOutOfService() != null ? r.hoursOutOfService() : 0.0)
                        .sum();

                Row rr = sheet2.createRow(roomRowNum++);
                rr.createCell(0).setCellValue(room);
                rr.createCell(1).setCellValue(roomIssues.size());
                setNum(rr.createCell(2), approvedCost.compareTo(BigDecimal.ZERO) == 0 ? null : approvedCost);
                setNum(rr.createCell(3), pendingCost.compareTo(BigDecimal.ZERO) == 0 ? null : pendingCost);
                rr.createCell(4).setCellValue(Math.round(totalHours * 10) / 10.0);
            }

            for (int i = 0; i < roomHeaders.length; i++) sheet2.autoSizeColumn(i);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);

            String range = (from != null ? "-" + from : "") + (to != null ? "-to-" + to : "");
            String filename = "finance-report" + range + ".xlsx";
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(baos.toByteArray());

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate export.");
        }
    }

    private static BigDecimal actualCost(IssueRecord r) {
        if (r.materialCost() != null) {
            return r.materialCost()
                    .add(r.laborCost() != null ? r.laborCost() : BigDecimal.ZERO)
                    .add(r.otherCost() != null ? r.otherCost() : BigDecimal.ZERO);
        }
        return r.actualCost() != null ? r.actualCost() : BigDecimal.ZERO;
    }

    private static String nvl(String v) {
        return v != null ? v : "";
    }

    private static void setNum(Cell cell, BigDecimal v) {
        if (v != null) cell.setCellValue(v.doubleValue());
        else cell.setCellValue("");
    }

    private UUID propertyId(Jwt jwt) {
        return JwtTenant.businessId(jwt);
    }
}
