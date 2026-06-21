package com.fixmyroom.auth;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PasswordResetStore {

    private record Entry(String email, Instant expiresAt) {}

    private final Map<String, Entry> tokens = new ConcurrentHashMap<>();
    private final SecureRandom rng = new SecureRandom();

    public String createToken(String email) {
        tokens.entrySet().removeIf(e -> e.getValue().email().equalsIgnoreCase(email));
        byte[] bytes = new byte[32];
        rng.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.put(token, new Entry(email.toLowerCase(), Instant.now().plusSeconds(1800)));
        return token;
    }

    /** Returns the email associated with the token, or null if invalid/expired. Consumes the token. */
    public String consumeToken(String token) {
        Entry entry = tokens.remove(token);
        if (entry == null) return null;
        if (Instant.now().isAfter(entry.expiresAt())) return null;
        return entry.email();
    }
}
