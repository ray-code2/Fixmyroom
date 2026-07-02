package com.fixmyroom.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig();

    @ParameterizedTest
    @ValueSource(strings = {
            "dev-only-change-this-secret-before-production-please",
            "change-this-to-a-long-random-secret-of-at-least-32-bytes"
    })
    void rejectsKnownPlaceholderSecrets(String placeholderSecret) {
        assertThatThrownBy(() -> securityConfig.jwtEncoder(placeholderSecret))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("placeholder");

        assertThatThrownBy(() -> securityConfig.jwtDecoder(placeholderSecret))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("placeholder");
    }

    @Test
    void rejectsSecretsShorterThan32Bytes() {
        assertThatThrownBy(() -> securityConfig.jwtEncoder("too-short"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    @Test
    void acceptsARealRandomSecret() {
        String realSecret = "r4nd0m-secret-that-is-definitely-long-enough-1234567890";

        assertThat(securityConfig.jwtEncoder(realSecret)).isNotNull();
        assertThat(securityConfig.jwtDecoder(realSecret)).isNotNull();
    }
}
