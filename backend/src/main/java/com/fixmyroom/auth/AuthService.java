package com.fixmyroom.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final Duration tokenTtl;

    public AuthService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            @Value("${app.security.jwt.issuer:fmr-local}") String issuer,
            @Value("${app.security.jwt.ttl-minutes:480}") long ttlMinutes
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.tokenTtl = Duration.ofMinutes(ttlMinutes);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        EmployeeRecord employee = employeeRepository.findActiveByEmail(normalizedEmail)
                .orElseThrow(() -> unauthorized(normalizedEmail));

        if (!passwordEncoder.matches(request.password(), employee.passwordHash())) {
            throw unauthorized(normalizedEmail);
        }

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(tokenTtl);
        String token = createToken(employee, issuedAt, expiresAt);

        log.info("Employee login succeeded employeeId={} hotelId={} role={}", employee.id(), employee.hotelId(), employee.role());
        return new AuthResponse(token, "Bearer", expiresAt, EmployeeProfileResponse.from(employee));
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (employeeRepository.findActiveByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        Instant now = Instant.now();
        UUID hotelId = UUID.randomUUID();
        UUID managerId = UUID.randomUUID();
        String address = (request.address() != null && !request.address().isBlank())
                ? request.address().trim() : "";

        employeeRepository.createHotel(hotelId, request.propertyName().trim(), address, "UTC", now);
        employeeRepository.createEmployee(
                managerId, hotelId, null, request.managerName().trim(),
                EmployeeRole.MANAGER, "en", null, email,
                passwordEncoder.encode(request.password()), now
        );

        EmployeeRecord manager = employeeRepository.findActiveById(managerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed."));

        Instant expiresAt = now.plus(tokenTtl);
        String token = createToken(manager, now, expiresAt);

        log.info("Property registered hotelId={} managerId={} email={}", hotelId, managerId, email);
        return new AuthResponse(token, "Bearer", expiresAt, EmployeeProfileResponse.from(manager));
    }

    public void addEmployee(AddEmployeeRequest request, UUID hotelId, UUID managerId) {
        String email = request.email().trim().toLowerCase();
        if (employeeRepository.findActiveByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An employee with this email already exists.");
        }

        UUID employeeId = UUID.randomUUID();
        Instant now = Instant.now();
        String phone = (request.phone() != null && !request.phone().isBlank()) ? request.phone().trim() : null;

        employeeRepository.createEmployee(
                employeeId, hotelId, managerId, request.name().trim(),
                request.role(), "en", phone, email,
                passwordEncoder.encode(request.password()), now
        );
        log.info("Employee added hotelId={} employeeId={} role={}", hotelId, employeeId, request.role());
    }

    public void resetEmployeePassword(UUID employeeId, UUID hotelId, String newPassword) {
        EmployeeRecord employee = employeeRepository.findByIdAndHotel(employeeId, hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found in your hotel."));

        if (employee.role() == EmployeeRole.MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot reset a manager's password. Contact FMR support.");
        }

        employeeRepository.updatePasswordHash(employeeId, passwordEncoder.encode(newPassword));
        log.info("Password reset for employeeId={} by hotelId={}", employeeId, hotelId);
    }

    public EmployeeProfileResponse currentUser(Jwt jwt) {
        UUID employeeId = parseEmployeeId(jwt.getSubject());
        EmployeeRecord employee = employeeRepository.findActiveById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated employee is no longer active."));

        return EmployeeProfileResponse.from(employee);
    }

    private String createToken(EmployeeRecord employee, Instant issuedAt, Instant expiresAt) {
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(employee.id().toString())
                .claim("hotel_id", employee.hotelId().toString())
                .claim("hotel_name", employee.hotelName())
                .claim("email", employee.email())
                .claim("name", employee.name())
                .claim("role", employee.role().name())
                .claim("roles", List.of(employee.role().name()))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    private ResponseStatusException unauthorized(String email) {
        log.warn("Employee login failed email={}", email);
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
    }

    private UUID parseEmployeeId(String subject) {
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication token subject is invalid.");
        }
    }
}
