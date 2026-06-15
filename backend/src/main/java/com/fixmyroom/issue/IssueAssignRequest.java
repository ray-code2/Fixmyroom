package com.fixmyroom.issue;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record IssueAssignRequest(@NotNull UUID technicianId) {}
