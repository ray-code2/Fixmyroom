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
        Instant resolvedAt
) {}
