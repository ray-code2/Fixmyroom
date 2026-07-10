package com.fixmyroom.issue;

import jakarta.validation.constraints.Size;

public record IssueDeclineRequest(
        @Size(max = 280) String reason
) {
    public static IssueDeclineRequest empty() {
        return new IssueDeclineRequest(null);
    }
}
