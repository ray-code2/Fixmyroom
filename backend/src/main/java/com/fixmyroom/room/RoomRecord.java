package com.fixmyroom.room;

import java.time.Instant;
import java.util.UUID;

public record RoomRecord(
        UUID id,
        UUID propertyId,
        String unitNumber,
        String floor,
        String unitType,
        boolean active,
        Instant createdAt
) {}
