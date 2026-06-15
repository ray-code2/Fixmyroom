package com.fixmyroom.room;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public List<RoomResponse> listRooms(@AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = UUID.fromString(jwt.getClaimAsString("hotel_id"));
        return roomRepository.findActiveByProperty(propertyId)
                .stream()
                .map(RoomResponse::from)
                .toList();
    }
}
