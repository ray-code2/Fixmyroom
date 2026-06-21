package com.fixmyroom.finance;

import com.fixmyroom.issue.CostStatus;
import com.fixmyroom.issue.IssueRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FinanceRowResponse(
        UUID issueId,
        String title,
        String unitNumber,
        String assignedToName,
        BigDecimal estimatedCost,
        BigDecimal materialCost,
        BigDecimal laborCost,
        BigDecimal otherCost,
        BigDecimal actualTotal,
        String costNotes,
        CostStatus costStatus,
        String costRejectionReason,
        Instant createdAt,
        Instant costApprovedAt
) {
    public static FinanceRowResponse from(IssueRecord r) {
        BigDecimal actualTotal = null;
        if (r.materialCost() != null) {
            actualTotal = r.materialCost()
                    .add(r.laborCost() != null ? r.laborCost() : BigDecimal.ZERO)
                    .add(r.otherCost() != null ? r.otherCost() : BigDecimal.ZERO);
        } else if (r.actualCost() != null) {
            actualTotal = r.actualCost();
        }
        return new FinanceRowResponse(
                r.id(), r.title(), r.unitNumber(), r.assignedToName(),
                r.estimatedCost(), r.materialCost(), r.laborCost(), r.otherCost(),
                actualTotal, r.costNotes(), r.costStatus(), r.costRejectionReason(),
                r.createdAt(), r.costApprovedAt()
        );
    }
}
