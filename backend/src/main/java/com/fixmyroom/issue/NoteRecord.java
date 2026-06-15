package com.fixmyroom.issue;

import java.time.Instant;
import java.util.UUID;

public record NoteRecord(
        UUID id,
        UUID issueId,
        UUID authorId,
        String authorName,
        String body,
        Instant createdAt
) {}
