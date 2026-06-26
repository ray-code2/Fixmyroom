package com.fixmyroom.room;

import com.fixmyroom.common.JwtTenant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        return roomRepository.findActiveByProperty(JwtTenant.businessId(jwt))
                .stream().map(RoomResponse::from).toList();
    }

    @GetMapping("/{id}")
    public RoomResponse getRoom(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return roomRepository.findByIdAndProperty(id, JwtTenant.businessId(jwt))
                .map(RoomResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody RoomCreateRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = JwtTenant.businessId(jwt);

        if (req.roomNumber() == null || req.roomNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room number is required.");
        }
        if (roomRepository.existsByPropertyAndRoomNumber(propertyId, req.roomNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Room \"" + req.roomNumber().trim() + "\" already exists.");
        }

        UUID id = roomRepository.createRoom(propertyId, req.roomNumber().trim(),
                blank(req.floor()), blank(req.roomType()));
        RoomResponse response = roomRepository.findByIdAndProperty(id, propertyId)
                .map(RoomResponse::from).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('MANAGER')")
    public BulkCreateResponse bulkCreateRooms(
            @RequestBody BulkRoomCreateRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = JwtTenant.businessId(jwt);

        if (req.rooms() == null || req.rooms().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room list is empty.");
        }
        if (req.rooms().size() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot create more than 500 rooms at once.");
        }

        int created = 0;
        int skipped = 0;
        for (RoomCreateRequest r : req.rooms()) {
            if (r.roomNumber() == null || r.roomNumber().isBlank()) { skipped++; continue; }
            String num = r.roomNumber().trim();
            if (roomRepository.existsByPropertyAndRoomNumber(propertyId, num)) {
                skipped++;
            } else {
                roomRepository.createRoom(propertyId, num, blank(r.floor()), blank(r.roomType()));
                created++;
            }
        }
        return new BulkCreateResponse(created, skipped);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateRoom(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        roomRepository.findByIdAndProperty(id, JwtTenant.businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));
        roomRepository.deactivateRoom(id);
    }

    private static String blank(String v) {
        return (v != null && !v.isBlank()) ? v.trim() : null;
    }

    public record BulkCreateResponse(int created, int skipped) {}
}
