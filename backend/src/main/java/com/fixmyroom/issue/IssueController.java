package com.fixmyroom.issue;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STAFF')")
    public IssueResponse create(@Valid @RequestBody IssueCreateRequest req,
                                @AuthenticationPrincipal Jwt jwt) {
        return issueService.create(req, employeeId(jwt), propertyId(jwt));
    }

    @GetMapping
    public List<IssueSummaryResponse> list(
            @RequestParam(required = false) IssueStatus status,
            @AuthenticationPrincipal Jwt jwt) {
        return issueService.list(propertyId(jwt), role(jwt), employeeId(jwt), status);
    }

    @GetMapping("/{id}")
    public IssueResponse get(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return issueService.get(id, propertyId(jwt));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER','TECHNICIAN')")
    public IssueResponse updateStatus(@PathVariable UUID id,
                                      @Valid @RequestBody IssueStatusRequest req,
                                      @AuthenticationPrincipal Jwt jwt) {
        return issueService.updateStatus(id, propertyId(jwt), req, employeeId(jwt), role(jwt));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('MANAGER')")
    public IssueResponse assign(@PathVariable UUID id,
                                @Valid @RequestBody IssueAssignRequest req,
                                @AuthenticationPrincipal Jwt jwt) {
        return issueService.assign(id, propertyId(jwt), req, employeeId(jwt));
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse addNote(@PathVariable UUID id,
                                @Valid @RequestBody NoteCreateRequest req,
                                @AuthenticationPrincipal Jwt jwt) {
        return issueService.addNote(id, propertyId(jwt), req, employeeId(jwt));
    }

    private UUID propertyId(Jwt jwt) {
        return UUID.fromString(jwt.getClaimAsString("hotel_id"));
    }

    private UUID employeeId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    private String role(Jwt jwt) {
        Object roles = jwt.getClaims().get("roles");
        if (roles instanceof List<?> list && !list.isEmpty()) {
            return list.get(0).toString().replace("ROLE_", "");
        }
        return "";
    }
}
