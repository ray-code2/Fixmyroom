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

    private static final String ISSUE_SELECT =
            "SELECT i.id, i.business_id, i.room_id, r.room_number, i.title, i.description, " +
            "i.category, i.priority, i.status, " +
            "i.reported_by, rep.name AS reported_by_name, " +
            "i.assigned_to, tech.name AS assigned_to_name, " +
            "i.estimated_cost, i.actual_cost, i.photo_url, " +
            "i.material_cost, i.labor_cost, i.other_cost, i.cost_notes, i.cost_status, " +
            "i.cost_submitted_by, i.cost_approved_by, i.cost_approved_at, i.cost_rejection_reason, " +
            "i.created_at, i.updated_at, i.resolved_at " +
            "FROM issues i " +
            "LEFT JOIN rooms r ON r.id = i.room_id " +
            "JOIN employees rep ON rep.id = i.reported_by " +
            "LEFT JOIN employees tech ON tech.id = i.assigned_to ";

    // --- Queries ---

    public List<IssueRecord> findByProperty(UUID propertyId, @Nullable IssueStatus status,
                                             @Nullable UUID assignedTo,
                                             @Nullable Instant from, @Nullable Instant to) {
        StringBuilder sql = new StringBuilder(ISSUE_SELECT).append("WHERE i.business_id = ?");
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
        if (from != null) {
            sql.append(" AND i.created_at >= ?");
            params.add(Timestamp.from(from));
        }
        if (to != null) {
            sql.append(" AND i.created_at < ?");
            params.add(Timestamp.from(to));
        }
        sql.append(" ORDER BY i.created_at DESC");

        return jdbc.query(sql.toString(), this::mapIssue, params.toArray());
    }

    public Optional<IssueRecord> findByIdAndProperty(UUID id, UUID propertyId) {
        List<IssueRecord> rows = jdbc.query(
                ISSUE_SELECT + "WHERE i.id = ? AND i.business_id = ?",
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
                "SELECT COUNT(*) FROM issues WHERE business_id = ? AND status = ?",
                Integer.class, propertyId, status.name()
        );
        return count == null ? 0 : count;
    }

    public int countByPropertyAndAssignedTo(UUID propertyId, UUID technicianId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE business_id = ? AND assigned_to = ? " +
                "AND status NOT IN ('COMPLETED','CANCELLED')",
                Integer.class, propertyId, technicianId
        );
        return count == null ? 0 : count;
    }

    public int countOpenByProperty(UUID propertyId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE business_id = ? AND status NOT IN ('COMPLETED','CANCELLED')",
                Integer.class, propertyId
        );
        return count == null ? 0 : count;
    }

    public int countByCostStatus(UUID propertyId, CostStatus costStatus) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM issues WHERE business_id = ? AND cost_status = ?",
                Integer.class, propertyId, costStatus.name()
        );
        return count == null ? 0 : count;
    }

    // Finance summary aggregates
    public FinanceAggregates getFinanceAggregates(UUID propertyId, @Nullable Instant from, @Nullable Instant to) {
        StringBuilder where = new StringBuilder("WHERE business_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(propertyId);
        if (from != null) { where.append(" AND created_at >= ?"); params.add(Timestamp.from(from)); }
        if (to != null)   { where.append(" AND created_at < ?");  params.add(Timestamp.from(to)); }

        return jdbc.query(
                "SELECT " +
                "COALESCE(SUM(estimated_cost), 0) AS total_estimated, " +
                "COALESCE(SUM(CASE WHEN material_cost IS NOT NULL THEN material_cost + COALESCE(labor_cost,0) + COALESCE(other_cost,0) ELSE actual_cost END), 0) AS total_actual, " +
                "COALESCE(SUM(CASE WHEN cost_status = 'APPROVED' THEN COALESCE(material_cost + COALESCE(labor_cost,0) + COALESCE(other_cost,0), actual_cost, 0) ELSE 0 END), 0) AS total_approved, " +
                "SUM(CASE WHEN cost_status = 'SUBMITTED' THEN 1 ELSE 0 END) AS pending_count, " +
                "SUM(CASE WHEN estimated_cost IS NOT NULL OR material_cost IS NOT NULL THEN 1 ELSE 0 END) AS issues_with_cost " +
                "FROM issues " + where,
                rs -> {
                    if (rs.next()) {
                        return new FinanceAggregates(
                                rs.getBigDecimal("total_estimated"),
                                rs.getBigDecimal("total_actual"),
                                rs.getBigDecimal("total_approved"),
                                rs.getInt("pending_count"),
                                rs.getInt("issues_with_cost")
                        );
                    }
                    return new FinanceAggregates(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0, 0);
                },
                params.toArray()
        );
    }

    public Double getAvgResolutionHours(UUID propertyId, @Nullable Instant from, @Nullable Instant to) {
        StringBuilder sql = new StringBuilder(
                "SELECT created_at, resolved_at FROM issues " +
                "WHERE business_id = ? AND status = 'COMPLETED' AND resolved_at IS NOT NULL");
        List<Object> params = new ArrayList<>();
        params.add(propertyId);
        if (from != null) { sql.append(" AND created_at >= ?"); params.add(Timestamp.from(from)); }
        if (to != null)   { sql.append(" AND created_at < ?");  params.add(Timestamp.from(to)); }

        List<Double> hours = jdbc.query(sql.toString(), (rs, n) -> {
            long ms = rs.getTimestamp("resolved_at").getTime() - rs.getTimestamp("created_at").getTime();
            return ms / 3_600_000.0;
        }, params.toArray());

        return hours.isEmpty() ? null : hours.stream().mapToDouble(d -> d).average().getAsDouble();
    }

    public BigDecimal getApprovedCostTotal(UUID propertyId, @Nullable Instant from, @Nullable Instant to) {
        StringBuilder sql = new StringBuilder(
                "SELECT COALESCE(SUM(CASE WHEN material_cost IS NOT NULL " +
                "THEN material_cost + COALESCE(labor_cost,0) + COALESCE(other_cost,0) " +
                "ELSE COALESCE(actual_cost,0) END), 0) AS total " +
                "FROM issues WHERE business_id = ? AND cost_status = 'APPROVED'");
        List<Object> params = new ArrayList<>();
        params.add(propertyId);
        if (from != null) { sql.append(" AND created_at >= ?"); params.add(Timestamp.from(from)); }
        if (to != null)   { sql.append(" AND created_at < ?");  params.add(Timestamp.from(to)); }

        BigDecimal result = jdbc.queryForObject(sql.toString(), BigDecimal.class, params.toArray());
        return result != null ? result : BigDecimal.ZERO;
    }

    // Finance table rows (all issues with cost data for manager)
    public List<IssueRecord> findForFinanceTable(UUID propertyId, @Nullable CostStatus costStatus,
                                                  @Nullable Instant from, @Nullable Instant to) {
        StringBuilder sql = new StringBuilder(ISSUE_SELECT).append("WHERE i.business_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(propertyId);
        if (costStatus != null) {
            sql.append(" AND i.cost_status = ?");
            params.add(costStatus.name());
        } else {
            sql.append(" AND (i.estimated_cost IS NOT NULL OR i.material_cost IS NOT NULL OR i.cost_status IS NOT NULL)");
        }
        if (from != null) { sql.append(" AND i.created_at >= ?"); params.add(Timestamp.from(from)); }
        if (to != null)   { sql.append(" AND i.created_at < ?");  params.add(Timestamp.from(to)); }
        sql.append(" ORDER BY i.created_at DESC");
        return jdbc.query(sql.toString(), this::mapIssue, params.toArray());
    }

    // --- Mutations ---

    public UUID create(UUID propertyId, @Nullable UUID roomId, String title, String description,
                       IssueCategory category, IssuePriority priority, UUID reportedBy) {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        // Dual-write business_id + hotel_id during the rename transition window.
        jdbc.update(
                "INSERT INTO issues (id, business_id, hotel_id, room_id, title, description, category, priority, " +
                "status, reported_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?)",
                id, propertyId, propertyId, roomId, title, description, category.name(), priority.name(),
                reportedBy, Timestamp.from(now), Timestamp.from(now)
        );
        addStatusHistory(id, reportedBy, null, IssueStatus.NEW, null);
        return id;
    }

    public void updatePhotoUrl(UUID issueId, String photoUrl) {
        jdbc.update(
                "UPDATE issues SET photo_url = ?, updated_at = ? WHERE id = ?",
                photoUrl, Timestamp.from(Instant.now()), issueId
        );
    }

    // --- Issue photos (1–3 per issue) ---

    public void addPhoto(UUID issueId, String url, int position) {
        jdbc.update(
                "INSERT INTO issue_photos (id, issue_id, url, position, created_at) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID(), issueId, url, position, Timestamp.from(Instant.now())
        );
    }

    public void deletePhotosByIssue(UUID issueId) {
        jdbc.update("DELETE FROM issue_photos WHERE issue_id = ?", issueId);
    }

    public List<String> findPhotoUrlsByIssue(UUID issueId) {
        return jdbc.query(
                "SELECT url FROM issue_photos WHERE issue_id = ? ORDER BY position ASC",
                (rs, n) -> rs.getString("url"), issueId
        );
    }

    public void saveCost(UUID issueId, @Nullable BigDecimal estimatedCost,
                         @Nullable BigDecimal materialCost, @Nullable BigDecimal laborCost,
                         @Nullable BigDecimal otherCost, @Nullable String costNotes, UUID submittedBy) {
        BigDecimal actualTotal = null;
        if (materialCost != null) {
            actualTotal = materialCost
                    .add(laborCost != null ? laborCost : BigDecimal.ZERO)
                    .add(otherCost != null ? otherCost : BigDecimal.ZERO);
        }
        jdbc.update(
                "UPDATE issues SET estimated_cost = COALESCE(?, estimated_cost), " +
                "material_cost = ?, labor_cost = ?, other_cost = ?, " +
                "actual_cost = COALESCE(?, actual_cost), " +
                "cost_notes = ?, cost_submitted_by = ?, cost_status = 'DRAFT', updated_at = ? WHERE id = ?",
                estimatedCost, materialCost, laborCost, otherCost, actualTotal,
                costNotes, submittedBy, Timestamp.from(Instant.now()), issueId
        );
    }

    public void submitCost(UUID issueId) {
        jdbc.update(
                "UPDATE issues SET cost_status = 'SUBMITTED', updated_at = ? WHERE id = ?",
                Timestamp.from(Instant.now()), issueId
        );
    }

    public void approveCost(UUID issueId, UUID approvedBy) {
        jdbc.update(
                "UPDATE issues SET cost_status = 'APPROVED', cost_approved_by = ?, " +
                "cost_approved_at = ?, cost_rejection_reason = NULL, updated_at = ? WHERE id = ?",
                approvedBy, Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), issueId
        );
    }

    public void rejectCost(UUID issueId, String reason) {
        jdbc.update(
                "UPDATE issues SET cost_status = 'REJECTED', cost_rejection_reason = ?, updated_at = ? WHERE id = ?",
                reason, Timestamp.from(Instant.now()), issueId
        );
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
        // Dual-write business_id + hotel_id during the rename transition window.
        jdbc.update(
                "INSERT INTO issues (id, business_id, hotel_id, room_id, title, description, category, priority, " +
                "status, reported_by, assigned_to, created_at, updated_at, resolved_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                id, propertyId, propertyId, roomId, title, description, category.name(), priority.name(),
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

    // --- Inner record for aggregates ---

    public record FinanceAggregates(
            BigDecimal totalEstimated,
            BigDecimal totalActual,
            BigDecimal totalApproved,
            int pendingCount,
            int issuesWithCost
    ) {}

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
        String roomIdStr = rs.getString("room_id");
        String assignedToId = rs.getString("assigned_to");
        String costStatusStr = rs.getString("cost_status");
        String costSubmittedByStr = rs.getString("cost_submitted_by");
        String costApprovedByStr = rs.getString("cost_approved_by");
        Timestamp costApprovedAt = rs.getTimestamp("cost_approved_at");
        return new IssueRecord(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("business_id")),
                roomIdStr == null ? null : UUID.fromString(roomIdStr),
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
                rs.getBigDecimal("estimated_cost"),
                rs.getBigDecimal("actual_cost"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                rs.getTimestamp("resolved_at") == null ? null : rs.getTimestamp("resolved_at").toInstant(),
                rs.getString("photo_url"),
                rs.getBigDecimal("material_cost"),
                rs.getBigDecimal("labor_cost"),
                rs.getBigDecimal("other_cost"),
                rs.getString("cost_notes"),
                costStatusStr == null ? null : CostStatus.valueOf(costStatusStr),
                costSubmittedByStr == null ? null : UUID.fromString(costSubmittedByStr),
                costApprovedByStr == null ? null : UUID.fromString(costApprovedByStr),
                costApprovedAt == null ? null : costApprovedAt.toInstant(),
                rs.getString("cost_rejection_reason")
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
