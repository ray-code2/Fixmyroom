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
                SELECT e.*, h.name AS hotel_name
                FROM employees e
                JOIN hotels h ON h.id = e.hotel_id
                WHERE LOWER(e.email) = LOWER(?) AND e.active = TRUE
                """, email);
    }

    public Optional<EmployeeRecord> findActiveById(UUID id) {
        return findOne("""
                SELECT e.*, h.name AS hotel_name
                FROM employees e
                JOIN hotels h ON h.id = e.hotel_id
                WHERE e.id = ? AND e.active = TRUE
                """, id);
    }

    public boolean hotelExists(UUID id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM hotels WHERE id = ?",
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

    public List<EmployeeTeamMember> findAllByHotel(UUID hotelId) {
        return jdbcTemplate.query("""
                SELECT id, name, role, email FROM employees
                WHERE hotel_id = ? AND role != 'MANAGER' AND active = TRUE
                ORDER BY role, name
                """,
                (rs, row) -> new EmployeeTeamMember(
                        rs.getObject("id", UUID.class),
                        rs.getString("name"),
                        rs.getString("role"),
                        rs.getString("email")
                ),
                hotelId
        );
    }

    public Optional<EmployeeRecord> findByIdAndHotel(UUID id, UUID hotelId) {
        return findOne("""
                SELECT e.*, h.name AS hotel_name
                FROM employees e
                JOIN hotels h ON h.id = e.hotel_id
                WHERE e.id = ? AND e.hotel_id = ? AND e.active = TRUE
                """, id, hotelId);
    }

    public void updatePasswordHash(UUID id, String hash) {
        jdbcTemplate.update(
                "UPDATE employees SET password_hash = ?, updated_at = ? WHERE id = ?",
                hash, Timestamp.from(Instant.now()), id
        );
    }

    public List<String> findManagerEmailsByHotel(UUID hotelId) {
        return jdbcTemplate.queryForList("""
                SELECT email FROM employees
                WHERE hotel_id = ? AND role = 'MANAGER' AND active = TRUE
                """,
                String.class,
                hotelId
        );
    }

    public List<EmployeeListResponse> findTechniciansByProperty(UUID hotelId) {
        return jdbcTemplate.query("""
                SELECT id, name FROM employees
                WHERE hotel_id = ? AND role = 'TECHNICIAN' AND active = TRUE
                ORDER BY name
                """,
                (rs, row) -> new EmployeeListResponse(
                        rs.getObject("id", UUID.class),
                        rs.getString("name")
                ),
                hotelId
        );
    }

    public void createHotel(UUID id, String name, String address, String timezone, Instant createdAt) {
        jdbcTemplate.update("""
                        INSERT INTO hotels (id, name, address, timezone, created_at)
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
            UUID hotelId,
            UUID managerId,
            String name,
            EmployeeRole role,
            String languagePreference,
            String phone,
            String email,
            String passwordHash,
            Instant createdAt
    ) {
        jdbcTemplate.update("""
                        INSERT INTO employees (
                            id, hotel_id, manager_id, name, role, language_preference, phone,
                            email, password_hash, active, created_at, updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
                        """,
                id,
                hotelId,
                managerId,
                name,
                role.name(),
                languagePreference,
                phone,
                email.toLowerCase(),
                passwordHash,
                Timestamp.from(createdAt),
                Timestamp.from(createdAt)
        );
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
                resultSet.getObject("hotel_id", UUID.class),
                resultSet.getObject("manager_id", UUID.class),
                resultSet.getString("hotel_name"),
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
