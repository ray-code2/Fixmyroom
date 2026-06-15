package com.fixmyroom.support;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SupportChatService {
    private static final Logger log = LoggerFactory.getLogger(SupportChatService.class);

    private static final String GEMINI_MODEL = "gemini-1.5-flash";
    private static final String SYSTEM_PROMPT = """
            You are FMR Support, a friendly AI assistant for hotel managers using Fix My Room (FMR) — \
            a property maintenance tracking SaaS.

            Your only job: help hotel managers who have forgotten their password or cannot log in.

            Key facts about FMR:
            - Hotel managers register their own account with a property name and email
            - Managers add staff and technicians — those users cannot register themselves
            - Staff and technician passwords are reset by the manager inside FMR (Manage Team screen)
            - Manager account password resets require identity verification by the FMR team

            When a manager says they forgot their password:
            1. Acknowledge and ask for their registered email address
            2. Once they provide it, confirm you've noted it and tell them the FMR team will send a reset \
            link to that address within 1 hour during business hours (9am–6pm MY time)
            3. Remind them to check their spam/junk folder

            Keep every response under 3 short sentences. Be warm, direct, and professional.
            Never invent or promise things you cannot do. Do not discuss topics beyond FMR login support.
            """;

    private final String apiKey;
    private final RestClient restClient;

    public SupportChatService(@Value("${app.gemini.api-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String chat(String userMessage, List<SupportChatRequest.ChatTurn> history) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured — returning fallback support message");
            return "AI support is not available right now. Please email the FMR team directly for password assistance.";
        }

        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            for (SupportChatRequest.ChatTurn turn : history) {
                if (turn.role() != null && turn.content() != null) {
                    // Gemini uses "model" instead of "assistant"
                    String geminiRole = "assistant".equals(turn.role()) ? "model" : "user";
                    contents.add(Map.of(
                            "role", geminiRole,
                            "parts", List.of(Map.of("text", turn.content()))
                    ));
                }
            }
        }
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
        ));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))));
        body.put("contents", contents);
        body.put("generationConfig", Map.of("maxOutputTokens", 512));

        try {
            GeminiApiResponse response = restClient.post()
                    .uri("/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiApiResponse.class);

            if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
                return "I'm having trouble connecting right now. Please try again in a moment.";
            }

            GeminiApiResponse.Candidate candidate = response.candidates().get(0);
            if (candidate.content() == null
                    || candidate.content().parts() == null
                    || candidate.content().parts().isEmpty()) {
                return "I'm having trouble generating a response. Please try again.";
            }

            return candidate.content().parts().get(0).text();

        } catch (RestClientException e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }
}
