package com.fixmyroom.issue;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record IssueRecord(
        UUID id,
        UUID propertyId,
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
        String costRejectionReason
) {
    /** Wall-clock hours the issue caused downtime.
     *  CANCELLED → null (false alarm, never counts).
     *  COMPLETED → final fixed value (resolvedAt − createdAt).
     *  All other statuses → live value (NOW − createdAt). */
    public Double hoursOutOfService() {
        if (status == IssueStatus.CANCELLED) return null;
        Instant end = (status == IssueStatus.COMPLETED && resolvedAt != null) ? resolvedAt : Instant.now();
        return (end.toEpochMilli() - createdAt.toEpochMilli()) / 3_600_000.0;
    }
}
