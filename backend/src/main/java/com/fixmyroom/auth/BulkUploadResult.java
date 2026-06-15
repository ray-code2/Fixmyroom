package com.fixmyroom.auth;

import java.util.List;

public record BulkUploadResult(
        int added,
        int failed,
        List<RowError> errors
) {
    public record RowError(int row, String email, String reason) {}
}
