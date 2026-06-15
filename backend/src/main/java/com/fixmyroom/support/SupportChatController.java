package com.fixmyroom.support;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/support")
public class SupportChatController {
    private final SupportChatService supportChatService;

    public SupportChatController(SupportChatService supportChatService) {
        this.supportChatService = supportChatService;
    }

    @PostMapping("/chat")
    SupportChatResponse chat(@Valid @RequestBody SupportChatRequest request) {
        List<SupportChatRequest.ChatTurn> history = request.history() != null ? request.history() : List.of();
        String reply = supportChatService.chat(request.message(), history);
        return new SupportChatResponse(reply);
    }
}
