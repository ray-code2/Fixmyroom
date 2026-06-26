package com.fixmyroom.common;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Resolves the tenant (business) id from a JWT.
 *
 * <p>During the rename transition window tokens may carry the new {@code business_id}
 * claim, the legacy {@code hotel_id} claim, or both. This helper is the single place
 * that knows about the fallback, so the dual-claim window can be closed by deleting
 * one method body once every in-flight token has been re-issued.
 */
public final class JwtTenant {

    private JwtTenant() {}

    /** The tenant id, always sourced from the token — never from client input. */
    public static UUID businessId(Jwt jwt) {
        String value = jwt.getClaimAsString("business_id");
        if (value == null || value.isBlank()) {
            value = jwt.getClaimAsString("hotel_id"); // legacy tokens issued before the rename
        }
        return UUID.fromString(value);
    }

    /** The tenant's display name, with legacy fallback. Empty string if absent. */
    public static String businessName(Jwt jwt) {
        String value = jwt.getClaimAsString("business_name");
        if (value == null || value.isBlank()) {
            value = jwt.getClaimAsString("hotel_name"); // legacy tokens issued before the rename
        }
        return value == null ? "" : value;
    }
}
