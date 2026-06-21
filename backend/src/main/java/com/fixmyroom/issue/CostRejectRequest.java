package com.fixmyroom.issue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CostRejectRequest(
        @NotBlank @Size(max = 280) String reason
) {}
