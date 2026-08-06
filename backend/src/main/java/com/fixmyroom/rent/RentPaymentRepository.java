package com.fixmyroom.rent;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RentPaymentRepository {

    private final JdbcTemplate jdbc;

    public RentPaymentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<RentPaymentRecord> findByBusiness(UUID businessId, Integer year, Integer month) {
        StringBuilder sql = new StringBuilder("""
                SELECT rp.*, t.name AS tenant_name, r.room_number AS unit_number
                FROM rent_payments rp
                JOIN tenants t ON t.id = rp.tenant_id
                LEFT JOIN rooms r ON r.id = rp.room_id
                WHERE rp.business_id = ?
                """);
        if (year != null) sql.append(" AND rp.period_year = ").append(year);
        if (month != null) sql.append(" AND rp.period_month = ").append(month);
        sql.append(" ORDER BY rp.period_year DESC, rp.period_month DESC, t.name");
        return jdbc.query(sql.toString(), this::map, businessId);
    }

    public Optional<RentPaymentRecord> findByIdAndBusiness(UUID id, UUID businessId) {
        List<RentPaymentRecord> rows = jdbc.query("""
                SELECT rp.*, t.name AS tenant_name, r.room_number AS unit_number
                FROM rent_payments rp
                JOIN tenants t ON t.id = rp.tenant_id
                LEFT JOIN rooms r ON r.id = rp.room_id
                WHERE rp.id = ? AND rp.business_id = ?
                """, this::map, id, businessId);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public UUID create(UUID businessId, RentPaymentRequest req) {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        BigDecimal amountDue = BigDecimal.valueOf(req.amountDue());
        BigDecimal amountPaid = req.amountPaid() != null ? BigDecimal.valueOf(req.amountPaid()) : BigDecimal.ZERO;
        RentPaymentStatus status = deriveStatus(amountDue, amountPaid);
        jdbc.update("""
                INSERT INTO rent_payments (id, tenant_id, business_id, room_id,
                    period_year, period_month, due_date, paid_date,
                    amount_due, amount_paid, currency, status, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                id,
                UUID.fromString(req.tenantId()),
                businessId,
                req.roomId() != null ? UUID.fromString(req.roomId()) : null,
                req.periodYear(),
                req.periodMonth(),
                req.dueDate() != null ? Date.valueOf(req.dueDate()) : null,
                req.paidDate() != null ? Date.valueOf(req.paidDate()) : null,
                amountDue,
                amountPaid,
                req.currency() != null ? req.currency().toUpperCase() : "USD",
                status.name(),
                req.notes(),
                Timestamp.from(now), Timestamp.from(now)
        );
        return id;
    }

    public void update(UUID id, RentPaymentRequest req) {
        BigDecimal amountDue = BigDecimal.valueOf(req.amountDue());
        BigDecimal amountPaid = req.amountPaid() != null ? BigDecimal.valueOf(req.amountPaid()) : BigDecimal.ZERO;
        RentPaymentStatus status = deriveStatus(amountDue, amountPaid);
        jdbc.update("""
                UPDATE rent_payments SET
                    period_year = ?, period_month = ?,
                    due_date = ?, paid_date = ?,
                    amount_due = ?, amount_paid = ?,
                    currency = ?, status = ?,
                    notes = ?, updated_at = ?
                WHERE id = ?
                """,
                req.periodYear(), req.periodMonth(),
                req.dueDate() != null ? Date.valueOf(req.dueDate()) : null,
                req.paidDate() != null ? Date.valueOf(req.paidDate()) : null,
                amountDue, amountPaid,
                req.currency() != null ? req.currency().toUpperCase() : "USD",
                status.name(),
                req.notes(),
                Timestamp.from(Instant.now()),
                id
        );
    }

    /** Derive status automatically from amounts so the frontend never needs to set it manually. */
    static RentPaymentStatus deriveStatus(BigDecimal amountDue, BigDecimal amountPaid) {
        if (amountPaid == null || amountPaid.compareTo(BigDecimal.ZERO) == 0) return RentPaymentStatus.UNPAID;
        if (amountPaid.compareTo(amountDue) >= 0) return RentPaymentStatus.PAID;
        return RentPaymentStatus.PARTIAL;
    }

    private RentPaymentRecord map(ResultSet rs, int row) throws SQLException {
        Date dueDate = rs.getDate("due_date");
        Date paidDate = rs.getDate("paid_date");
        return new RentPaymentRecord(
                rs.getObject("id", UUID.class),
                rs.getObject("tenant_id", UUID.class),
                rs.getObject("business_id", UUID.class),
                rs.getObject("room_id", UUID.class),
                rs.getInt("period_year"),
                rs.getInt("period_month"),
                dueDate != null ? dueDate.toLocalDate() : null,
                paidDate != null ? paidDate.toLocalDate() : null,
                rs.getBigDecimal("amount_due"),
                rs.getBigDecimal("amount_paid"),
                rs.getString("currency"),
                RentPaymentStatus.valueOf(rs.getString("status")),
                rs.getString("notes"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                rs.getString("tenant_name"),
                rs.getString("unit_number")
        );
    }
}
