package com.fixmyroom.room;

import com.fixmyroom.common.JwtTenant;
import com.fixmyroom.issue.IssueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;
    private final IssueRepository issueRepository;

    public RoomController(RoomRepository roomRepository, IssueRepository issueRepository) {
        this.roomRepository = roomRepository;
        this.issueRepository = issueRepository;
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
        if (req.roomNumber().trim().length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room number cannot exceed 20 characters.");
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

    /**
     * Hard-deletes the room if nothing references it. If issues have been reported against it,
     * deleting would either violate the room_id foreign key or silently erase which room those
     * issues were about — so it falls back to the existing deactivate (hide from active lists,
     * history preserved) instead, and tells the caller which one happened.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public DeleteRoomResponse deleteRoom(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        roomRepository.findByIdAndProperty(id, JwtTenant.businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));

        int issueCount = issueRepository.countByRoom(id);
        if (issueCount == 0) {
            roomRepository.deleteRoom(id);
            return new DeleteRoomResponse(true, 0);
        }
        roomRepository.deactivateRoom(id);
        return new DeleteRoomResponse(false, issueCount);
    }

    /** PATCH /api/rooms/{id}/revenue — update rent + vacancy settings without touching issue history */
    @PatchMapping("/{id}/revenue")
    @PreAuthorize("hasRole('MANAGER')")
    public RoomResponse updateRevenueFields(
            @PathVariable UUID id,
            @RequestBody RoomRevenueRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        UUID propertyId = JwtTenant.businessId(jwt);
        roomRepository.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));
        BigDecimal monthlyRent = req.monthlyRent() != null ? BigDecimal.valueOf(req.monthlyRent()) : null;
        BigDecimal ratePerDay = req.vacancyRatePerDay() != null ? BigDecimal.valueOf(req.vacancyRatePerDay()) : null;
        roomRepository.updateRevenueFields(id, monthlyRent, ratePerDay, req.vacancyStart());
        return roomRepository.findByIdAndProperty(id, propertyId)
                .map(RoomResponse::from).orElseThrow();
    }

    private static String blank(String v) {
        return (v != null && !v.isBlank()) ? v.trim() : null;
    }

    public record BulkCreateResponse(int created, int skipped) {}

    public record DeleteRoomResponse(boolean deleted, int issueCount) {}
}
