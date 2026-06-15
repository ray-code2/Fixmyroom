package com.fixmyroom.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SupportChatRequest(
        @NotBlank @Size(max = 1000) String message,
        List<ChatTurn> history
) {
    public record ChatTurn(String role, String content) {}
}
