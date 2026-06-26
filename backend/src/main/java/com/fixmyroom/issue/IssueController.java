package com.fixmyroom.issue;

import com.fixmyroom.common.JwtTenant;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
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

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF')")
    public IssueResponse uploadPhoto(@PathVariable UUID id,
                                     @RequestParam("file") MultipartFile file,
                                     @AuthenticationPrincipal Jwt jwt) {
        return issueService.uploadPhoto(id, file, propertyId(jwt));
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF')")
    public IssueResponse uploadPhotos(@PathVariable UUID id,
                                      @RequestParam("files") List<MultipartFile> files,
                                      @AuthenticationPrincipal Jwt jwt) {
        return issueService.uploadPhotos(id, files, propertyId(jwt));
    }

    @GetMapping
    public List<IssueSummaryResponse> list(
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt) {
        return issueService.list(propertyId(jwt), role(jwt), employeeId(jwt), status, from, to);
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

    @PutMapping("/{id}/cost")
    @PreAuthorize("hasAnyRole('MANAGER','TECHNICIAN')")
    public IssueResponse updateCost(@PathVariable UUID id,
                                    @Valid @RequestBody IssueCostRequest req,
                                    @AuthenticationPrincipal Jwt jwt) {
        return issueService.updateCost(id, propertyId(jwt), req, employeeId(jwt), role(jwt));
    }

    @PostMapping("/{id}/cost/submit")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public IssueResponse submitCost(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return issueService.submitCost(id, propertyId(jwt), employeeId(jwt));
    }

    @PostMapping("/{id}/cost/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public IssueResponse approveCost(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return issueService.approveCost(id, propertyId(jwt), employeeId(jwt));
    }

    @PostMapping("/{id}/cost/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public IssueResponse rejectCost(@PathVariable UUID id,
                                    @Valid @RequestBody CostRejectRequest req,
                                    @AuthenticationPrincipal Jwt jwt) {
        return issueService.rejectCost(id, propertyId(jwt), req);
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse addNote(@PathVariable UUID id,
                                @Valid @RequestBody NoteCreateRequest req,
                                @AuthenticationPrincipal Jwt jwt) {
        return issueService.addNote(id, propertyId(jwt), req, employeeId(jwt));
    }

    private UUID propertyId(Jwt jwt) {
        return JwtTenant.businessId(jwt);
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
