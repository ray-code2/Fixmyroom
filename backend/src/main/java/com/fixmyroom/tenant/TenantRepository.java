package com.fixmyroom.tenant;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class TenantRepository {

    private final JdbcTemplate jdbc;

    public TenantRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<TenantRecord> findActiveByBusiness(UUID businessId) {
        return jdbc.query("""
                SELECT t.*, r.room_number AS unit_number
                FROM tenants t
                LEFT JOIN rooms r ON r.id = t.room_id
                WHERE t.business_id = ? AND t.active = TRUE
                ORDER BY t.name
                """, this::map, businessId);
    }

    public Optional<TenantRecord> findByIdAndBusiness(UUID id, UUID businessId) {
        List<TenantRecord> rows = jdbc.query("""
                SELECT t.*, r.room_number AS unit_number
                FROM tenants t
                LEFT JOIN rooms r ON r.id = t.room_id
                WHERE t.id = ? AND t.business_id = ?
                """, this::map, id, businessId);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public UUID create(UUID businessId, TenantRequest req) {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        jdbc.update("""
                INSERT INTO tenants (id, business_id, room_id, name, phone, email,
                    check_in_date, check_out_date, active, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)
                """,
                id, businessId,
                req.roomId() != null ? UUID.fromString(req.roomId()) : null,
                req.name().trim(),
                req.phone(),
                req.email(),
                req.checkInDate() != null ? Date.valueOf(req.checkInDate()) : null,
                req.checkOutDate() != null ? Date.valueOf(req.checkOutDate()) : null,
                req.notes(),
                Timestamp.from(now), Timestamp.from(now)
        );
        return id;
    }

    public void update(UUID id, TenantRequest req) {
        jdbc.update("""
                UPDATE tenants SET
                    room_id = ?,
                    name = ?,
                    phone = ?,
                    email = ?,
                    check_in_date = ?,
                    check_out_date = ?,
                    notes = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                req.roomId() != null ? UUID.fromString(req.roomId()) : null,
                req.name().trim(),
                req.phone(),
                req.email(),
                req.checkInDate() != null ? Date.valueOf(req.checkInDate()) : null,
                req.checkOutDate() != null ? Date.valueOf(req.checkOutDate()) : null,
                req.notes(),
                Timestamp.from(Instant.now()),
                id
        );
    }

    public void deactivate(UUID id) {
        jdbc.update("UPDATE tenants SET active = FALSE, updated_at = ? WHERE id = ?",
                Timestamp.from(Instant.now()), id);
    }

    private TenantRecord map(ResultSet rs, int row) throws SQLException {
        Date ciDate = rs.getDate("check_in_date");
        Date coDate = rs.getDate("check_out_date");
        return new TenantRecord(
                rs.getObject("id", UUID.class),
                rs.getObject("business_id", UUID.class),
                rs.getObject("room_id", UUID.class),
                rs.getString("name"),
                rs.getString("phone"),
                rs.getString("email"),
                ciDate != null ? ciDate.toLocalDate() : null,
                coDate != null ? coDate.toLocalDate() : null,
                rs.getBoolean("active"),
                rs.getString("notes"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                rs.getString("unit_number")
        );
    }
}
