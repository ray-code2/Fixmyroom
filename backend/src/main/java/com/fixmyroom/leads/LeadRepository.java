package com.fixmyroom.leads;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public class LeadRepository {
    private final JdbcTemplate jdbcTemplate;

    public LeadRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(UUID id, LeadRequest request, Instant createdAt) {
        jdbcTemplate.update("""
                        INSERT INTO landing_leads (
                            id, full_name, role, property_name, property_type, email, phone,
                            room_count, lead_type, notes, source, submitted_at, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                id,
                request.fullName(),
                blankToNull(request.role()),
                request.propertyName(),
                request.propertyType().name(),
                request.email(),
                blankToNull(request.phone()),
                request.roomCount(),
                request.leadType().name(),
                blankToNull(request.notes()),
                request.source(),
                Timestamp.from(request.submittedAt()),
                Timestamp.from(createdAt)
        );
    }

    public List<LeadExportRow> findAllForExport() {
        return jdbcTemplate.query("""
                        SELECT full_name, role, property_name, property_type, email, phone,
                               room_count, lead_type, notes, submitted_at
                        FROM landing_leads
                        ORDER BY submitted_at DESC
                        """,
                (rs, rowNum) -> new LeadExportRow(
                        rs.getString("full_name"),
                        rs.getString("role"),
                        rs.getString("property_name"),
                        rs.getString("property_type"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getInt("room_count"),
                        rs.getString("lead_type"),
                        rs.getString("notes"),
                        rs.getTimestamp("submitted_at") != null
                                ? rs.getTimestamp("submitted_at").toInstant().toString() : ""
                )
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
