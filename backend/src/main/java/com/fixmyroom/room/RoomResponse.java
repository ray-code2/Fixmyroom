package com.fixmyroom.room;

import java.util.UUID;

public record RoomResponse(UUID id, String unitNumber, String floor, String unitType) {

    public static RoomResponse from(RoomRecord r) {
        return new RoomResponse(r.id(), r.unitNumber(), r.floor(), r.unitType());
    }
}
