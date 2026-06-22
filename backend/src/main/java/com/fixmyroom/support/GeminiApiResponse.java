package com.fixmyroom.support;

import java.util.List;

public record GeminiApiResponse(List<Candidate> candidates) {
    public record Candidate(Content content, String finishReason) {}
    public record Content(List<Part> parts) {}
    public record Part(String text) {}
}
