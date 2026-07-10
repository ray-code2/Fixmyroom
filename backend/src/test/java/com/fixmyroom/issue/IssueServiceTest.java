package com.fixmyroom.issue;

import com.fixmyroom.auth.EmployeeRepository;
import com.fixmyroom.email.EmailService;
import com.fixmyroom.room.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.ThrowingSupplier;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class IssueServiceTest {

    private final IssueRepository issueRepo = mock(IssueRepository.class);
    private final RoomRepository roomRepo = mock(RoomRepository.class);
    private final EmployeeRepository employeeRepo = mock(EmployeeRepository.class);
    private final EmailService emailService = mock(EmailService.class);
    private final IssueService service = new IssueService(issueRepo, roomRepo, employeeRepo, emailService);

    private final UUID propertyId = UUID.randomUUID();
    private final UUID issueId = UUID.randomUUID();
    private final UUID managerId = UUID.randomUUID();
    private final UUID technicianId = UUID.randomUUID();

    @BeforeEach
    void stubReadsUsedByGetAfterEveryMutation() {
        // approve/decline/assign/updateStatus all call get(id, propertyId) at the end to
        // return the fresh state — give every test a permissive stub for that re-read.
        when(issueRepo.findNotesByIssue(any())).thenReturn(List.of());
        when(issueRepo.findPhotoUrlsByIssue(any())).thenReturn(List.of());
        when(employeeRepo.findActiveById(any())).thenReturn(Optional.empty());
    }

    private IssueRecord issueWithStatus(IssueStatus status) {
        return issueWithStatusAndAssignee(status, null);
    }

    private IssueRecord issueWithStatusAndAssignee(IssueStatus status, UUID assignedTo) {
        Instant now = Instant.now();
        return new IssueRecord(
                issueId, propertyId, "Test Business", null, "101", "Leaky tap", "desc",
                IssueCategory.PLUMBING, IssuePriority.MEDIUM, status,
                UUID.randomUUID(), "Staffer", assignedTo, assignedTo != null ? "Tech" : null,
                null, null, now, now, null, null,
                null, null, null, null, null, null, null, null, null,
                1
        );
    }

    private void stubFind(IssueRecord record) {
        when(issueRepo.findByIdAndProperty(issueId, propertyId)).thenReturn(Optional.of(record));
    }

    private static ResponseStatusException catchStatusException(ThrowingSupplier<?> action) {
        return catchThrowableOfType(action::get, ResponseStatusException.class);
    }

    // ── approve() ──────────────────────────────────────────────────────────────

    @Test
    void approveSucceedsFromNewAndPersistsEstimate() {
        stubFind(issueWithStatus(IssueStatus.NEW));

        service.approve(issueId, propertyId, new IssueApproveRequest(new BigDecimal("150.00"), "looks legit"), managerId);

        verify(issueRepo).approve(issueId, managerId, new BigDecimal("150.00"), "looks legit");
    }

    @ParameterizedTest
    @MethodSource("nonNewStatuses")
    void approveFailsWithConflictWhenNotNew(IssueStatus status) {
        stubFind(issueWithStatus(status));

        ResponseStatusException ex = catchStatusException(
                () -> service.approve(issueId, propertyId, IssueApproveRequest.empty(), managerId));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    // ── decline() ──────────────────────────────────────────────────────────────

    @Test
    void declineSucceedsFromNew() {
        stubFind(issueWithStatus(IssueStatus.NEW));

        service.decline(issueId, propertyId, new IssueDeclineRequest("not a real issue"), managerId);

        verify(issueRepo).decline(issueId, managerId, "not a real issue");
    }

    @ParameterizedTest
    @MethodSource("nonNewStatuses")
    void declineFailsWithConflictWhenNotNew(IssueStatus status) {
        stubFind(issueWithStatus(status));

        ResponseStatusException ex = catchStatusException(
                () -> service.decline(issueId, propertyId, IssueDeclineRequest.empty(), managerId));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private static Stream<IssueStatus> nonNewStatuses() {
        return Stream.of(IssueStatus.APPROVED, IssueStatus.DECLINED, IssueStatus.ASSIGNED,
                IssueStatus.IN_PROGRESS, IssueStatus.WAITING_PARTS, IssueStatus.COMPLETED, IssueStatus.CANCELLED);
    }

    // ── assign() gate ────────────────────────────────────────────────────────

    @ParameterizedTest
    @MethodSource("assignableStatuses")
    void assignSucceedsFromApprovedOrAssigned(IssueStatus status) {
        stubFind(issueWithStatus(status));

        service.assign(issueId, propertyId, new IssueAssignRequest(technicianId), managerId);

        verify(issueRepo).assignTechnician(issueId, technicianId, managerId, status);
    }

    private static Stream<IssueStatus> assignableStatuses() {
        return Stream.of(IssueStatus.APPROVED, IssueStatus.ASSIGNED);
    }

    @ParameterizedTest
    @MethodSource("unassignableStatuses")
    void assignFailsWithConflictUnlessApprovedOrAssigned(IssueStatus status) {
        stubFind(issueWithStatus(status));

        ResponseStatusException ex = catchStatusException(
                () -> service.assign(issueId, propertyId, new IssueAssignRequest(technicianId), managerId));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private static Stream<IssueStatus> unassignableStatuses() {
        return Stream.of(IssueStatus.NEW, IssueStatus.DECLINED, IssueStatus.IN_PROGRESS,
                IssueStatus.WAITING_PARTS, IssueStatus.COMPLETED, IssueStatus.CANCELLED);
    }

    @Test
    void assignPassesTheRealPreviousStatusNotAHardcodedOne() {
        // Regression test for the from_status=NEW hardcoding bug: reassigning an already-
        // ASSIGNED ticket must record ASSIGNED as the audit-trail "from", not NEW.
        stubFind(issueWithStatus(IssueStatus.ASSIGNED));

        service.assign(issueId, propertyId, new IssueAssignRequest(technicianId), managerId);

        verify(issueRepo).assignTechnician(eq(issueId), eq(technicianId), eq(managerId), eq(IssueStatus.ASSIGNED));
    }

    // ── validateStatusTransition() — MANAGER, via generic updateStatus() ───────

    @ParameterizedTest
    @MethodSource("managerAllowedTransitions")
    void managerCanMakeTheseTransitions(IssueStatus from, IssueStatus to) {
        stubFind(issueWithStatus(from));

        service.updateStatus(issueId, propertyId, new IssueStatusRequest(to, null, null, null), managerId, "MANAGER");

        verify(issueRepo).updateStatus(issueId, to, managerId, null, null, null);
    }

    private static Stream<Arguments> managerAllowedTransitions() {
        return Stream.of(
                Arguments.of(IssueStatus.APPROVED, IssueStatus.CANCELLED),
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS),
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.CANCELLED),
                Arguments.of(IssueStatus.IN_PROGRESS, IssueStatus.WAITING_PARTS),
                Arguments.of(IssueStatus.IN_PROGRESS, IssueStatus.COMPLETED),
                Arguments.of(IssueStatus.IN_PROGRESS, IssueStatus.CANCELLED),
                Arguments.of(IssueStatus.WAITING_PARTS, IssueStatus.IN_PROGRESS),
                Arguments.of(IssueStatus.WAITING_PARTS, IssueStatus.COMPLETED),
                Arguments.of(IssueStatus.WAITING_PARTS, IssueStatus.CANCELLED)
        );
    }

    @ParameterizedTest
    @MethodSource("managerBlockedTransitions")
    void managerCannotBypassTheGateOrDedicatedEndpointsViaPatch(IssueStatus from, IssueStatus to) {
        stubFind(issueWithStatus(from));

        ResponseStatusException ex = catchStatusException(() -> service.updateStatus(
                issueId, propertyId, new IssueStatusRequest(to, null, null, null), managerId, "MANAGER"));

        assertThat(ex).isNotNull();
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private static Stream<Arguments> managerBlockedTransitions() {
        return Stream.of(
                Arguments.of(IssueStatus.NEW, IssueStatus.APPROVED),
                Arguments.of(IssueStatus.NEW, IssueStatus.DECLINED),
                Arguments.of(IssueStatus.NEW, IssueStatus.CANCELLED),
                Arguments.of(IssueStatus.NEW, IssueStatus.ASSIGNED),
                Arguments.of(IssueStatus.APPROVED, IssueStatus.ASSIGNED),
                Arguments.of(IssueStatus.APPROVED, IssueStatus.IN_PROGRESS),
                Arguments.of(IssueStatus.APPROVED, IssueStatus.COMPLETED),
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.COMPLETED),
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.APPROVED)
        );
    }

    // ── validateStatusTransition() — TECHNICIAN ─────────────────────────────────

    @ParameterizedTest
    @MethodSource("technicianAllowedDestinations")
    void technicianCanMoveTheirOwnTicketToTheseDestinations(IssueStatus from, IssueStatus to) {
        stubFind(issueWithStatusAndAssignee(from, technicianId));

        service.updateStatus(issueId, propertyId, new IssueStatusRequest(to, null, null, null), technicianId, "TECHNICIAN");

        verify(issueRepo).updateStatus(issueId, to, technicianId, null, null, null);
    }

    private static Stream<Arguments> technicianAllowedDestinations() {
        return Stream.of(
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS),
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.WAITING_PARTS),
                Arguments.of(IssueStatus.ASSIGNED, IssueStatus.COMPLETED),
                Arguments.of(IssueStatus.IN_PROGRESS, IssueStatus.WAITING_PARTS),
                Arguments.of(IssueStatus.IN_PROGRESS, IssueStatus.COMPLETED),
                Arguments.of(IssueStatus.WAITING_PARTS, IssueStatus.IN_PROGRESS),
                Arguments.of(IssueStatus.WAITING_PARTS, IssueStatus.COMPLETED)
        );
    }

    @ParameterizedTest
    @MethodSource("technicianBlockedDestinations")
    void technicianCannotReachTheseDestinations(IssueStatus to) {
        stubFind(issueWithStatusAndAssignee(IssueStatus.ASSIGNED, technicianId));

        ResponseStatusException ex = catchStatusException(() -> service.updateStatus(
                issueId, propertyId, new IssueStatusRequest(to, null, null, null), technicianId, "TECHNICIAN"));

        assertThat(ex).isNotNull();
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    private static Stream<IssueStatus> technicianBlockedDestinations() {
        return Stream.of(IssueStatus.NEW, IssueStatus.APPROVED, IssueStatus.CANCELLED);
    }

    @Test
    void technicianCannotUpdateSomeoneElsesTicket() {
        stubFind(issueWithStatusAndAssignee(IssueStatus.ASSIGNED, UUID.randomUUID()));

        ResponseStatusException ex = catchStatusException(() -> service.updateStatus(issueId, propertyId,
                new IssueStatusRequest(IssueStatus.IN_PROGRESS, null, null, null), technicianId, "TECHNICIAN"));

        assertThat(ex).isNotNull();
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── validateStatusTransition() — STAFF ──────────────────────────────────────

    @Test
    void staffCanNeverChangeStatus() {
        stubFind(issueWithStatus(IssueStatus.NEW));

        ResponseStatusException ex = catchStatusException(() -> service.updateStatus(issueId, propertyId,
                new IssueStatusRequest(IssueStatus.APPROVED, null, null, null), UUID.randomUUID(), "STAFF"));

        assertThat(ex).isNotNull();
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── terminal-state guard ────────────────────────────────────────────────────

    @ParameterizedTest
    @MethodSource("terminalStatuses")
    void noOneCanChangeStatusOnATerminalIssue(IssueStatus terminal) {
        stubFind(issueWithStatus(terminal));

        ResponseStatusException ex = catchStatusException(() -> service.updateStatus(issueId, propertyId,
                new IssueStatusRequest(IssueStatus.IN_PROGRESS, null, null, null), managerId, "MANAGER"));

        assertThat(ex).isNotNull();
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private static Stream<IssueStatus> terminalStatuses() {
        return Stream.of(IssueStatus.COMPLETED, IssueStatus.CANCELLED, IssueStatus.DECLINED);
    }
}
