package com.fixmyroom.leads;

import java.time.Instant;
import java.util.UUID;

public record LeadResponse(
        UUID id,
        String status,
        Instant createdAt
) {
}
