package com.fixmyroom.room;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RoomRepository {

    private final JdbcTemplate jdbc;

    public RoomRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<RoomRecord> findActiveByProperty(UUID propertyId) {
        return jdbc.query(
                "SELECT id, hotel_id, room_number, floor, room_type, active, created_at " +
                "FROM rooms WHERE hotel_id = ? AND active = TRUE ORDER BY room_number",
                this::map, propertyId
        );
    }

    public Optional<RoomRecord> findByIdAndProperty(UUID id, UUID propertyId) {
        List<RoomRecord> rows = jdbc.query(
                "SELECT id, hotel_id, room_number, floor, room_type, active, created_at " +
                "FROM rooms WHERE id = ? AND hotel_id = ?",
                this::map, id, propertyId
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public boolean existsByProperty(UUID propertyId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM rooms WHERE hotel_id = ?", Integer.class, propertyId
        );
        return count != null && count > 0;
    }

    public UUID createRoom(UUID propertyId, String unitNumber, String floor, String unitType) {
        return createRoom(UUID.randomUUID(), propertyId, unitNumber, floor, unitType);
    }

    /** Used by seed/demo initializers that need stable, pre-defined IDs. */
    public UUID createRoom(UUID id, UUID propertyId, String unitNumber, String floor, String unitType) {
        jdbc.update(
                "INSERT INTO rooms (id, hotel_id, room_number, floor, room_type, active, created_at) " +
                "VALUES (?, ?, ?, ?, ?, TRUE, ?)",
                id, propertyId, unitNumber, floor, unitType, Timestamp.from(Instant.now())
        );
        return id;
    }

    private RoomRecord map(ResultSet rs, int row) throws SQLException {
        return new RoomRecord(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("hotel_id")),
                rs.getString("room_number"),
                rs.getString("floor"),
                rs.getString("room_type"),
                rs.getBoolean("active"),
                rs.getTimestamp("created_at").toInstant()
        );
    }
}
