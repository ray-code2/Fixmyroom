package com.fixmyroom.auth;

import org.springframework.dao.EmptyResultDataAccessException;
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
public class EmployeeRepository {
    private final JdbcTemplate jdbcTemplate;

    public EmployeeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<EmployeeRecord> findActiveByEmail(String email) {
        return findOne("""
                SELECT e.*, b.name AS business_name
                FROM employees e
                JOIN businesses b ON b.id = e.business_id
                WHERE LOWER(e.email) = LOWER(?) AND e.active = TRUE
                """, email);
    }

    public Optional<EmployeeRecord> findActiveById(UUID id) {
        return findOne("""
                SELECT e.*, b.name AS business_name
                FROM employees e
                JOIN businesses b ON b.id = e.business_id
                WHERE e.id = ? AND e.active = TRUE
                """, id);
    }

    public boolean businessExists(UUID id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM businesses WHERE id = ?",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    public boolean employeeExists(UUID id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM employees WHERE id = ?",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    public List<EmployeeTeamMember> findAllByBusiness(UUID businessId) {
        return jdbcTemplate.query("""
                SELECT id, name, role, email, notes, specialties FROM employees
                WHERE business_id = ? AND role != 'MANAGER' AND active = TRUE
                ORDER BY role, name
                """,
                (rs, row) -> new EmployeeTeamMember(
                        rs.getObject("id", UUID.class),
                        rs.getString("name"),
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("notes"),
                        splitCsv(rs.getString("specialties"))
                ),
                businessId
        );
    }

    public Optional<EmployeeRecord> findByIdAndBusiness(UUID id, UUID businessId) {
        return findOne("""
                SELECT e.*, b.name AS business_name
                FROM employees e
                JOIN businesses b ON b.id = e.business_id
                WHERE e.id = ? AND e.business_id = ? AND e.active = TRUE
                """, id, businessId);
    }

    public void updatePasswordHash(UUID id, String hash) {
        jdbcTemplate.update(
                "UPDATE employees SET password_hash = ?, updated_at = ? WHERE id = ?",
                hash, Timestamp.from(Instant.now()), id
        );
    }

    public List<String> findManagerEmailsByBusiness(UUID businessId) {
        return jdbcTemplate.queryForList("""
                SELECT email FROM employees
                WHERE business_id = ? AND role = 'MANAGER' AND active = TRUE
                """,
                String.class,
                businessId
        );
    }

    /** Who a staff/technician reports to — used on the staff dashboard's "Report to" list. */
    public List<ManagerContact> findActiveManagersByBusiness(UUID businessId) {
        return jdbcTemplate.query("""
                SELECT id, name, email, phone FROM employees
                WHERE business_id = ? AND role = 'MANAGER' AND active = TRUE
                ORDER BY name
                """,
                (rs, row) -> new ManagerContact(
                        rs.getObject("id", UUID.class),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("phone")
                ),
                businessId
        );
    }

    public List<EmployeeListResponse> findTechniciansByProperty(UUID businessId) {
        return jdbcTemplate.query("""
                SELECT id, name, specialties FROM employees
                WHERE business_id = ? AND role = 'TECHNICIAN' AND active = TRUE
                ORDER BY name
                """,
                (rs, row) -> new EmployeeListResponse(
                        rs.getObject("id", UUID.class),
                        rs.getString("name"),
                        splitCsv(rs.getString("specialties"))
                ),
                businessId
        );
    }

    public void createBusiness(UUID id, String name, String address, String timezone, Instant createdAt) {
        jdbcTemplate.update("""
                        INSERT INTO businesses (id, name, address, timezone, created_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                id,
                name,
                address,
                timezone,
                Timestamp.from(createdAt)
        );
    }

    public void createEmployee(
            UUID id,
            UUID businessId,
            UUID managerId,
            String name,
            EmployeeRole role,
            String languagePreference,
            String phone,
            String email,
            String passwordHash,
            String notes,
            String specialtiesCsv,
            Instant createdAt
    ) {
        // Dual-write business_id + hotel_id during the rename transition window so a
        // rollback to pre-rename code (which still reads hotel_id) keeps working.
        jdbcTemplate.update("""
                        INSERT INTO employees (
                            id, business_id, hotel_id, manager_id, name, role, language_preference, phone,
                            email, password_hash, notes, specialties, active, created_at, updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
                        """,
                id,
                businessId,
                businessId,
                managerId,
                name,
                role.name(),
                languagePreference,
                phone,
                email.toLowerCase(),
                passwordHash,
                notes,
                specialtiesCsv,
                Timestamp.from(createdAt),
                Timestamp.from(createdAt)
        );
    }

    private static List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return java.util.Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private Optional<EmployeeRecord> findOne(String sql, Object... parameters) {
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, this::mapEmployee, parameters));
        } catch (EmptyResultDataAccessException exception) {
            return Optional.empty();
        }
    }

    private EmployeeRecord mapEmployee(ResultSet resultSet, int rowNumber) throws SQLException {
        return new EmployeeRecord(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("business_id", UUID.class),
                resultSet.getObject("manager_id", UUID.class),
                resultSet.getString("business_name"),
                resultSet.getString("name"),
                EmployeeRole.valueOf(resultSet.getString("role")),
                resultSet.getString("language_preference"),
                resultSet.getString("phone"),
                resultSet.getString("email"),
                resultSet.getString("password_hash"),
                resultSet.getBoolean("active")
        );
    }
}
