package com.fixmyroom.room;

import java.util.List;

public record BulkRoomCreateRequest(List<RoomCreateRequest> rooms) {}
