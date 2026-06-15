package com.fixmyroom.issue;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record IssueResponse(
        UUID id,
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
        List<NoteResponse> notes,
        BigDecimal estimatedCost,
        BigDecimal actualCost,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt
) {
    public static IssueResponse from(IssueRecord r, List<NoteResponse> notes) {
        return new IssueResponse(
                r.id(), r.roomId(), r.unitNumber(), r.title(), r.description(),
                r.category(), r.priority(), r.status(),
                r.reportedById(), r.reportedByName(),
                r.assignedToId(), r.assignedToName(),
                notes, r.estimatedCost(), r.actualCost(),
                r.createdAt(), r.updatedAt(), r.resolvedAt()
        );
    }
}
