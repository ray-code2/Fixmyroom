package com.fixmyroom.issue;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record IssueSummaryResponse(
        UUID id,
        String unitNumber,
        String title,
        String description,
        IssueCategory category,
        IssuePriority priority,
        IssueStatus status,
        String reportedByName,
        String assignedToName,
        BigDecimal estimatedCost,
        BigDecimal actualCost,
        String photoUrl,
        Instant createdAt,
        Instant updatedAt,
        Double hoursOutOfService
) {
    public static IssueSummaryResponse from(IssueRecord r) {
        return new IssueSummaryResponse(
                r.id(), r.unitNumber(), r.title(), r.description(), r.category(), r.priority(),
                r.status(), r.reportedByName(), r.assignedToName(),
                r.estimatedCost(), r.actualCost(), r.photoUrl(),
                r.createdAt(), r.updatedAt(), r.hoursOutOfService()
        );
    }
}
