package com.fixmyroom.room;

public record RoomCreateRequest(
        String roomNumber,
        String floor,
        String roomType
) {}
