package com.fixmyroom.issue;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record IssueRecord(
        UUID id,
        UUID propertyId,
        String businessName,
        UUID roomId,
        String unitNumber,
        String title,
        String description,
        IssueCategory category,
        IssuePriority priority,
        IssueStatus status,
        UUID reportedById,
        String reportedByName,
        UUID assignedToId,
        String assignedToName,
        BigDecimal estimatedCost,
        BigDecimal actualCost,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt,
        String photoUrl,
        BigDecimal materialCost,
        BigDecimal laborCost,
        BigDecimal otherCost,
        String costNotes,
        CostStatus costStatus,
        UUID costSubmittedBy,
        UUID costApprovedBy,
        Instant costApprovedAt,
        String costRejectionReason,
        int roomSequence
) {
    /** Wall-clock hours the issue caused downtime.
     *  CANCELLED/DECLINED → null (false alarm or never a real issue — never counts).
     *  COMPLETED → final fixed value (resolvedAt − createdAt).
     *  All other statuses → live value (NOW − createdAt). */
    public Double hoursOutOfService() {
        if (status == IssueStatus.CANCELLED || status == IssueStatus.DECLINED) return null;
        Instant end = (status == IssueStatus.COMPLETED && resolvedAt != null) ? resolvedAt : Instant.now();
        return (end.toEpochMilli() - createdAt.toEpochMilli()) / 3_600_000.0;
    }

    /**
     * Human-readable ticket reference — e.g. "FMR-SUN-101-00001". The 00001 is a per-room
     * sequence (see the room_sequence subquery in IssueRepository), not the issue's row count
     * overall, so it stays stable no matter which filtered view it's read from.
     */
    public String ticketId() {
        return "FMR-" + businessCode() + "-" + roomSegment() + "-" + String.format("%05d", roomSequence);
    }

    private String businessCode() {
        String alnum = businessName == null ? "" : businessName.replaceAll("[^A-Za-z0-9]", "");
        String code = alnum.length() > 3 ? alnum.substring(0, 3) : alnum;
        return code.isEmpty() ? "FMR" : code.toUpperCase();
    }

    private String roomSegment() {
        if (unitNumber == null || unitNumber.isBlank()) return "GEN";
        return unitNumber.replaceAll("\\s+", "").toUpperCase();
    }
}
