package com.fixmyroom.issue;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record IssueCreateRequest(
        @Nullable UUID roomId,
        @NotBlank @Size(max = 100) String title,
        @Size(max = 1000) String description,
        @NotNull IssueCategory category,
        @NotNull IssuePriority priority
) {}
