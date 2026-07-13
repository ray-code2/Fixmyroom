package com.fixmyroom.auth;

import com.fixmyroom.email.EmailService;
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
    private final PasswordResetStore passwordResetStore;
    private final EmailService emailService;
    private final String issuer;
    private final Duration tokenTtl;

    public AuthService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            PasswordResetStore passwordResetStore,
            EmailService emailService,
            @Value("${app.security.jwt.issuer:fmr-local}") String issuer,
            @Value("${app.security.jwt.ttl-minutes:480}") long ttlMinutes
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.passwordResetStore = passwordResetStore;
        this.emailService = emailService;
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

        log.info("Employee login succeeded employeeId={} businessId={} role={}", employee.id(), employee.businessId(), employee.role());
        return new AuthResponse(token, "Bearer", expiresAt, EmployeeProfileResponse.from(employee));
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (employeeRepository.findActiveByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        Instant now = Instant.now();
        UUID businessId = UUID.randomUUID();
        UUID managerId = UUID.randomUUID();
        String address = (request.address() != null && !request.address().isBlank())
                ? request.address().trim() : "";

        employeeRepository.createBusiness(businessId, request.propertyName().trim(), address, "UTC", now);
        employeeRepository.createEmployee(
                managerId, businessId, null, request.managerName().trim(),
                EmployeeRole.MANAGER, "en", null, email,
                passwordEncoder.encode(request.password()), null, null, now
        );

        EmployeeRecord manager = employeeRepository.findActiveById(managerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed."));

        Instant expiresAt = now.plus(tokenTtl);
        String token = createToken(manager, now, expiresAt);

        log.info("Property registered businessId={} managerId={} email={}", businessId, managerId, email);
        return new AuthResponse(token, "Bearer", expiresAt, EmployeeProfileResponse.from(manager));
    }

    public void addEmployee(AddEmployeeRequest request, UUID businessId, UUID managerId) {
        String email = request.email().trim().toLowerCase();
        if (employeeRepository.findActiveByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An employee with this email already exists.");
        }

        UUID employeeId = UUID.randomUUID();
        Instant now = Instant.now();
        String phone = (request.phone() != null && !request.phone().isBlank()) ? request.phone().trim() : null;
        String notes = (request.notes() != null && !request.notes().isBlank()) ? request.notes().trim() : null;

        employeeRepository.createEmployee(
                employeeId, businessId, managerId, request.name().trim(),
                request.role(), "en", phone, email,
                passwordEncoder.encode(request.password()),
                notes, normalizeSpecialties(request.specialties(), request.role()), now
        );
        log.info("Employee added businessId={} employeeId={} role={}", businessId, employeeId, request.role());
    }

    /**
     * Technicians only: map free-form tokens ("Plumbing", "HVAC / Air-con", "LOCK KEY")
     * onto IssueCategory names and store them as CSV. Unknown tokens are dropped rather
     * than rejected so a half-filled Excel column doesn't fail the whole row.
     */
    private static String normalizeSpecialties(List<String> raw, EmployeeRole role) {
        if (raw == null || raw.isEmpty() || role != EmployeeRole.TECHNICIAN) return null;
        var valid = new java.util.LinkedHashSet<String>();
        for (String token : raw) {
            if (token == null || token.isBlank()) continue;
            String candidate = token.trim().toUpperCase()
                    .replaceAll("[^A-Z]+", "_")
                    .replaceAll("^_+|_+$", "");
            if (candidate.startsWith("HVAC") || candidate.startsWith("AIR")) candidate = "HVAC";
            try {
                valid.add(com.fixmyroom.issue.IssueCategory.valueOf(candidate).name());
            } catch (IllegalArgumentException ignored) {
                // unknown category token — skip
            }
        }
        return valid.isEmpty() ? null : String.join(",", valid);
    }

    public void resetEmployeePassword(UUID employeeId, UUID businessId, String newPassword) {
        EmployeeRecord employee = employeeRepository.findByIdAndBusiness(employeeId, businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found in your business."));

        if (employee.role() == EmployeeRole.MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot reset a manager's password. Contact FMR support.");
        }

        employeeRepository.updatePasswordHash(employeeId, passwordEncoder.encode(newPassword));
        log.info("Password reset for employeeId={} by businessId={}", employeeId, businessId);
    }

    public void forgotPassword(String email) {
        String normalized = email.trim().toLowerCase();
        var found = employeeRepository.findActiveByEmail(normalized);
        if (found.isEmpty()) {
            log.info("Password reset requested for unknown email — no email sent (response is still 204).");
            return;
        }
        EmployeeRecord emp = found.get();
        if (emp.role() != EmployeeRole.MANAGER) {
            log.info("Password reset requested for non-manager role={} — no email sent (response is still 204).", emp.role());
            return;
        }
        String token = passwordResetStore.createToken(emp.email());
        emailService.sendPasswordResetEmail(emp.email(), token);
        log.info("Password reset email dispatched to manager email={}", emp.email());
    }

    public void resetPassword(String token, String newPassword) {
        String email = passwordResetStore.consumeToken(token);
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link is invalid or has expired.");
        }
        EmployeeRecord emp = employeeRepository.findActiveByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found."));
        if (emp.role() != EmployeeRole.MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Password reset via email is only available for managers.");
        }
        employeeRepository.updatePasswordHash(emp.id(), passwordEncoder.encode(newPassword));
        log.info("Manager password reset via token for email={}", email);
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
                // Dual tenancy claims during the rename transition window.
                // business_id/business_name are canonical; hotel_id/hotel_name are kept
                // so tokens minted here keep working for any not-yet-updated reader and
                // for sessions that downgrade to old code. Remove the legacy pair only
                // after the window is confirmed safe and all clients are re-issued tokens.
                .claim("business_id", employee.businessId().toString())
                .claim("business_name", employee.businessName())
                .claim("hotel_id", employee.businessId().toString())
                .claim("hotel_name", employee.businessName())
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
