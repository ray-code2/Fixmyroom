package com.fixmyroom.issue;

import jakarta.annotation.Nullable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class IssueRepository {

    private final JdbcTemplate jdbc;

    public IssueRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // --- Queries ---

    public List<IssueRecord> findByProperty(UUID propertyId, @Nullable IssueStatus status, @Nullable UUID assignedTo) {
        StringBuilder sql = new StringBuilder(
                "SELECT i.id, i.hotel_id, i.room_id, r.room_number, i.title, i.description, " +
                "i.category, i.priority, i.status, " +
                "i.reported_by, rep.name AS reported_by_name, " +
                "i.assigned_to, tech.name AS assigned_to_name, " +
                "i.estimated_cost, i.actual_cost, " +
                "i.created_at, i.updated_at, i.resolved_at " +
                "FROM issues i " +
                "JOIN rooms r ON r.id = i.room_id " +
                "JOIN employees rep ON rep.id = i.reported_by " +
                "LEFT JOIN employees tech ON tech.id = i.assigned_to " +
                "WHERE i.hotel_id = ?"
        );
        List<Object> params = new ArrayList<>();
        params.add(propertyId);

        if (status != null) {
            sql.append(" AND i.status = ?");
            params.add(status.name());
        }
        if (assignedTo != null) {
            sql.append(" AND i.assigned_to = ?");
            params.add(assignedTo);
        }
        sql.append(" ORDER BY i.created_at DESC");

        return jdbc.query(sql.toString(), this::mapIssue, params.toArray());
    }

    public Optional<IssueRecord> findByIdAndProperty(UUID id, UUID propertyId) {
        List<IssueRecord> rows = jdbc.query(
                "SELECT i.id, i.hotel_id, i.room_id, r.room_number, i.title, i.description, " +
                "i.category, i.priority, i.status, " +
                "i.reported_by, rep.name AS reported_by_name, " +
                "i.assigned_to, tech.name AS assigned_to_name, " +
                "i.estimated_cost, i.actual_cost, " +
                "i.created_at, i.updated_at, i.resolved_at " +
                "FROM issues i " +
                "JOIN rooms r ON r.id = i.room_id " +
                "JOIN employees rep ON rep.id = i.reported_by " +
                "LEFT JOIN employees tech ON tech.id = i.assigned_to " +
                "WHERE i.id = ? AND i.hotel_id = ?",
                this::mapIssue, id, propertyId
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<NoteRecord> findNotesByIssue(UUID issueId) {
        return jdbc.query(
                "SELECT n.id, n.issue_id, n.author_id, e.name AS author_name, n.body, n.created_at " +
                "FROM issue_notes n JOIN employees e ON e.id = n.author_id " +
                "WHERE n.issue_id = ? ORDER BY n.created_at ASC",
                this::mapNote, issueId
        );
    }

    public int countByPropertyAndStatus(UUID propertyId, IssueStatus status) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE hotel_id = ? AND status = ?",
                Integer.class, propertyId, status.name()
        );
        return count == null ? 0 : count;
    }

    public int countByPropertyAndAssignedTo(UUID propertyId, UUID technicianId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE hotel_id = ? AND assigned_to = ? " +
                "AND status NOT IN ('COMPLETED','CANCELLED')",
                Integer.class, propertyId, technicianId
        );
        return count == null ? 0 : count;
    }

    public int countOpenByProperty(UUID propertyId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE hotel_id = ? AND status NOT IN ('COMPLETED','CANCELLED')",
                Integer.class, propertyId
        );
        return count == null ? 0 : count;
    }

    // --- Mutations ---

    public UUID create(UUID propertyId, UUID roomId, String title, String description,
                       IssueCategory category, IssuePriority priority, UUID reportedBy) {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        jdbc.update(
                "INSERT INTO issues (id, hotel_id, room_id, title, description, category, priority, " +
                "status, reported_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?)",
                id, propertyId, roomId, title, description, category.name(), priority.name(),
                reportedBy, Timestamp.from(now), Timestamp.from(now)
        );
        addStatusHistory(id, reportedBy, null, IssueStatus.NEW, null);
        return id;
    }

    public void updateStatus(UUID id, IssueStatus status, UUID changedBy,
                             @Nullable String note,
                             @Nullable BigDecimal estimatedCost,
                             @Nullable BigDecimal actualCost) {
        Instant now = Instant.now();
        Timestamp resolvedAt = (status == IssueStatus.COMPLETED || status == IssueStatus.CANCELLED)
                ? Timestamp.from(now) : null;

        IssueStatus previous = jdbc.query(
                "SELECT status FROM issues WHERE id = ?",
                rs -> rs.next() ? IssueStatus.valueOf(rs.getString("status")) : null,
                id
        );

        jdbc.update(
                "UPDATE issues SET status = ?, updated_at = ?, resolved_at = ?, " +
                "estimated_cost = COALESCE(?, estimated_cost), " +
                "actual_cost = COALESCE(?, actual_cost) " +
                "WHERE id = ?",
                status.name(), Timestamp.from(now), resolvedAt,
                estimatedCost, actualCost, id
        );
        addStatusHistory(id, changedBy, previous, status, note);
    }

    public void assignTechnician(UUID id, UUID technicianId, UUID changedBy) {
        Instant now = Instant.now();
        jdbc.update(
                "UPDATE issues SET assigned_to = ?, status = 'ASSIGNED', updated_at = ? WHERE id = ?",
                technicianId, Timestamp.from(now), id
        );
        addStatusHistory(id, changedBy, IssueStatus.NEW, IssueStatus.ASSIGNED, null);
    }

    public UUID addNote(UUID issueId, UUID authorId, String body) {
        UUID id = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO issue_notes (id, issue_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)",
                id, issueId, authorId, body, Timestamp.from(Instant.now())
        );
        return id;
    }

    public void seedIssue(UUID id, UUID propertyId, UUID roomId, String title, String description,
                          IssueCategory category, IssuePriority priority, IssueStatus status,
                          UUID reportedBy, UUID assignedTo, Instant createdAt) {
        Timestamp resolvedAt = (status == IssueStatus.COMPLETED || status == IssueStatus.CANCELLED)
                ? Timestamp.from(createdAt.plusSeconds(3600)) : null;
        jdbc.update(
                "INSERT INTO issues (id, hotel_id, room_id, title, description, category, priority, " +
                "status, reported_by, assigned_to, created_at, updated_at, resolved_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                id, propertyId, roomId, title, description, category.name(), priority.name(),
                status.name(), reportedBy, assignedTo,
                Timestamp.from(createdAt), Timestamp.from(createdAt), resolvedAt
        );
    }

    public boolean issueExists(UUID id) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE id = ?", Integer.class, id
        );
        return count != null && count > 0;
    }

    // --- Private helpers ---

    private void addStatusHistory(UUID issueId, UUID changedBy,
                                  @Nullable IssueStatus from, IssueStatus to, @Nullable String note) {
        jdbc.update(
                "INSERT INTO issue_status_history (id, issue_id, changed_by, from_status, to_status, note, changed_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), issueId, changedBy,
                from == null ? null : from.name(), to.name(),
                note, Timestamp.from(Instant.now())
        );
    }

    private IssueRecord mapIssue(ResultSet rs, int row) throws SQLException {
        String assignedToId = rs.getString("assigned_to");
        BigDecimal estimatedCost = rs.getBigDecimal("estimated_cost");
        BigDecimal actualCost = rs.getBigDecimal("actual_cost");
        return new IssueRecord(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("hotel_id")),
                UUID.fromString(rs.getString("room_id")),
                rs.getString("room_number"),
                rs.getString("title"),
                rs.getString("description"),
                IssueCategory.valueOf(rs.getString("category")),
                IssuePriority.valueOf(rs.getString("priority")),
                IssueStatus.valueOf(rs.getString("status")),
                UUID.fromString(rs.getString("reported_by")),
                rs.getString("reported_by_name"),
                assignedToId == null ? null : UUID.fromString(assignedToId),
                rs.getString("assigned_to_name"),
                estimatedCost,
                actualCost,
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                rs.getTimestamp("resolved_at") == null ? null : rs.getTimestamp("resolved_at").toInstant()
        );
    }

    private NoteRecord mapNote(ResultSet rs, int row) throws SQLException {
        return new NoteRecord(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("issue_id")),
                UUID.fromString(rs.getString("author_id")),
                rs.getString("author_name"),
                rs.getString("body"),
                rs.getTimestamp("created_at").toInstant()
        );
    }
}
