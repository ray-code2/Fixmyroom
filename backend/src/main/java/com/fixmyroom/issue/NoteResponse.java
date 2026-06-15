package com.fixmyroom.issue;

import java.time.Instant;
import java.util.UUID;

public record NoteResponse(UUID id, UUID authorId, String authorName, String body, Instant createdAt) {

    public static NoteResponse from(NoteRecord n) {
        return new NoteResponse(n.id(), n.authorId(), n.authorName(), n.body(), n.createdAt());
    }
}
