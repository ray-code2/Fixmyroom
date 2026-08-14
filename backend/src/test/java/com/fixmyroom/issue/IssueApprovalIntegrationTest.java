package com.fixmyroom.issue;

import com.fixmyroom.auth.AuthService;
import com.fixmyroom.auth.EmployeeRepository;
import com.fixmyroom.auth.EmployeeRole;
import com.fixmyroom.auth.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers what IssueServiceTest can't as a plain unit test: real @PreAuthorize role
 * enforcement and real tenant scoping through the actual HTTP endpoints, against an
 * isolated in-memory H2 database (never touches the dev file DB).
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:issue-approval-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "app.security.jwt.secret=test-only-secret-that-is-definitely-at-least-32-bytes-long",
        "app.seed.enabled=false"
})
@Transactional // each test's fixtures roll back afterward — @SpringBootTest reuses one context/DB across all tests
class IssueApprovalIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private IssueRepository issueRepo;
    @Autowired private AuthService authService;
    @Autowired private PasswordEncoder passwordEncoder;

    private UUID businessA;
    private UUID staffAId;
    private UUID managerAId;

    private String managerAToken;
    private String staffAToken;
    private String managerBToken;

    @BeforeEach
    void setUp() {
        businessA = UUID.randomUUID();
        UUID businessB = UUID.randomUUID();
        Instant now = Instant.now();

        employeeRepo.createBusiness(businessA, "Business A", "addr", "UTC", "HOTEL", "USD", now);
        employeeRepo.createBusiness(businessB, "Business B", "addr", "UTC", "HOTEL", "USD", now);

        managerAId = UUID.randomUUID();
        staffAId = UUID.randomUUID();
        UUID technicianAId = UUID.randomUUID();
        UUID managerBId = UUID.randomUUID();

        String hash = passwordEncoder.encode("Password123!");
        employeeRepo.createEmployee(managerAId, businessA, null, "Manager A",
                EmployeeRole.MANAGER, "en", null, "managerA@test.com", hash, null, null, now);
        employeeRepo.createEmployee(staffAId, businessA, managerAId, "Staff A",
                EmployeeRole.STAFF, "en", null, "staffA@test.com", hash, null, null, now);
        employeeRepo.createEmployee(technicianAId, businessA, managerAId, "Tech A",
                EmployeeRole.TECHNICIAN, "en", null, "techA@test.com", hash, null, null, now);
        employeeRepo.createEmployee(managerBId, businessB, null, "Manager B",
                EmployeeRole.MANAGER, "en", null, "managerB@test.com", hash, null, null, now);

        managerAToken = login("managerA@test.com");
        staffAToken = login("staffA@test.com");
        managerBToken = login("managerB@test.com");
    }

    private String login(String email) {
        return authService.login(new LoginRequest(email, "Password123!")).accessToken();
    }

    private UUID seedNewIssue(UUID businessId) {
        UUID id = UUID.randomUUID();
        issueRepo.seedIssue(id, businessId, null, "Test issue", "desc",
                IssueCategory.OTHER, IssuePriority.LOW, IssueStatus.NEW, staffAId, null, Instant.now());
        return id;
    }

    @Test
    void managerApprovesAFreshNewTicket() throws Exception {
        UUID issueId = seedNewIssue(businessA);

        mockMvc.perform(post("/api/issues/{id}/approve", issueId)
                        .header("Authorization", "Bearer " + managerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estimatedCost\": 100.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.estimatedCost", is(100.00)));
    }

    @Test
    void managerDeclinesAFreshNewTicket() throws Exception {
        UUID issueId = seedNewIssue(businessA);

        mockMvc.perform(post("/api/issues/{id}/decline", issueId)
                        .header("Authorization", "Bearer " + managerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\": \"not a real issue\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DECLINED")));
    }

    @Test
    void approvingAnAlreadyApprovedTicketConflicts() throws Exception {
        UUID issueId = seedNewIssue(businessA);
        issueRepo.approve(issueId, managerAId, null, null);

        mockMvc.perform(post("/api/issues/{id}/approve", issueId)
                        .header("Authorization", "Bearer " + managerAToken))
                .andExpect(status().isConflict());
    }

    @Test
    void staffCannotApprove() throws Exception {
        UUID issueId = seedNewIssue(businessA);

        mockMvc.perform(post("/api/issues/{id}/approve", issueId)
                        .header("Authorization", "Bearer " + staffAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffCannotDecline() throws Exception {
        UUID issueId = seedNewIssue(businessA);

        mockMvc.perform(post("/api/issues/{id}/decline", issueId)
                        .header("Authorization", "Bearer " + staffAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerFromAnotherBusinessCannotApproveOrSeeTheTicket() throws Exception {
        UUID issueId = seedNewIssue(businessA);

        mockMvc.perform(post("/api/issues/{id}/approve", issueId)
                        .header("Authorization", "Bearer " + managerBToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedRequestIsRejected() throws Exception {
        UUID issueId = seedNewIssue(businessA);

        mockMvc.perform(post("/api/issues/{id}/approve", issueId))
                .andExpect(status().isUnauthorized());
    }
}
