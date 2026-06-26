package com.fixmyroom.issue;

import com.fixmyroom.auth.EmployeeRepository;
import com.fixmyroom.email.EmailService;
import com.fixmyroom.room.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class IssueService {

    private static final int MAX_PHOTOS = 3;

    private final IssueRepository issueRepo;
    private final RoomRepository roomRepo;
    private final EmployeeRepository employeeRepo;
    private final EmailService emailService;

    public IssueService(IssueRepository issueRepo, RoomRepository roomRepo,
                        EmployeeRepository employeeRepo, EmailService emailService) {
        this.issueRepo = issueRepo;
        this.roomRepo = roomRepo;
        this.employeeRepo = employeeRepo;
        this.emailService = emailService;
    }

    public IssueResponse create(IssueCreateRequest req, UUID reportedBy, UUID propertyId) {
        if (req.roomId() != null) {
            roomRepo.findByIdAndProperty(req.roomId(), propertyId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Unit not found in this property."));
        }

        UUID id = issueRepo.create(propertyId, req.roomId(), req.title(),
                req.description(), req.category(), req.priority(), reportedBy);

        IssueResponse created = issueRepo.findByIdAndProperty(id, propertyId)
                .map(r -> IssueResponse.from(r, List.of()))
                .orElseThrow();

        List<String> managerEmails = employeeRepo.findManagerEmailsByBusiness(propertyId);
        emailService.sendNewIssueNotification(managerEmails, req.title(), created.unitNumber());
        return created;
    }

    /** Single-photo upload kept for backwards compatibility — delegates to the multi-photo path. */
    public IssueResponse uploadPhoto(UUID issueId, MultipartFile file, UUID propertyId) {
        return uploadPhotos(issueId, List.of(file), propertyId);
    }

    /** Attach 1–3 photos to an issue. Replaces any photos already attached. */
    public IssueResponse uploadPhotos(UUID issueId, List<MultipartFile> files, UUID propertyId) {
        issueRepo.findByIdAndProperty(issueId, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No photos provided.");
        }
        if (files.size() > MAX_PHOTOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You can attach at most " + MAX_PHOTOS + " photos.");
        }

        // Validate every file up front so a bad upload never wipes existing photos.
        for (MultipartFile file : files) {
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPEG and PNG images are accepted.");
            }
        }

        try {
            Path uploadsDir = Path.of(System.getProperty("user.dir"), "uploads");
            Files.createDirectories(uploadsDir);

            issueRepo.deletePhotosByIssue(issueId);

            String firstUrl = null;
            int position = 0;
            for (MultipartFile file : files) {
                String extension = "image/png".equals(file.getContentType()) ? ".png" : ".jpg";
                String filename = issueId + "_" + position + extension;
                Files.write(uploadsDir.resolve(filename), file.getBytes());
                String url = "/uploads/" + filename;
                issueRepo.addPhoto(issueId, url, position);
                if (firstUrl == null) firstUrl = url;
                position++;
            }
            // Keep issues.photo_url pointed at the first photo for list thumbnails / legacy callers.
            issueRepo.updatePhotoUrl(issueId, firstUrl);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save photos.");
        }

        return get(issueId, propertyId);
    }

    public List<IssueSummaryResponse> list(UUID propertyId, String role, UUID employeeId,
                                           IssueStatus statusFilter,
                                           LocalDate from, LocalDate to) {
        UUID assignedToFilter = "TECHNICIAN".equals(role) ? employeeId : null;
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        return issueRepo.findByProperty(propertyId, statusFilter, assignedToFilter, fromInstant, toInstant)
                .stream()
                .map(IssueSummaryResponse::from)
                .toList();
    }

    public IssueResponse get(UUID id, UUID propertyId) {
        IssueRecord record = issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));
        List<NoteResponse> notes = issueRepo.findNotesByIssue(id)
                .stream().map(NoteResponse::from).toList();
        List<String> photoUrls = issueRepo.findPhotoUrlsByIssue(id);
        return IssueResponse.from(record, notes, photoUrls);
    }

    public IssueResponse updateStatus(UUID id, UUID propertyId, IssueStatusRequest req,
                                      UUID changedBy, String role) {
        IssueRecord record = issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        validateStatusTransition(record, req.status(), role, changedBy);

        issueRepo.updateStatus(id, req.status(), changedBy, req.note(), req.estimatedCost(), req.actualCost());
        return get(id, propertyId);
    }

    public IssueResponse assign(UUID id, UUID propertyId, IssueAssignRequest req, UUID managerId) {
        issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        issueRepo.assignTechnician(id, req.technicianId(), managerId);
        IssueResponse assigned = get(id, propertyId);
        employeeRepo.findActiveById(req.technicianId()).ifPresent(tech ->
                emailService.sendAssignedNotification(tech.email(), assigned.title()));
        return assigned;
    }

    public IssueResponse updateCost(UUID id, UUID propertyId, IssueCostRequest req,
                                    UUID requesterId, String role) {
        IssueRecord record = issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        if ("TECHNICIAN".equals(role)) {
            if (record.assignedToId() == null || !record.assignedToId().equals(requesterId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You can only update cost for issues assigned to you.");
            }
        }

        if (record.costStatus() == CostStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cost has already been approved and cannot be modified.");
        }

        issueRepo.saveCost(id, req.estimatedCost(), req.materialCost(), req.laborCost(),
                req.otherCost(), req.costNotes(), requesterId);
        return get(id, propertyId);
    }

    public IssueResponse submitCost(UUID id, UUID propertyId, UUID requesterId) {
        IssueRecord record = issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        if (record.assignedToId() == null || !record.assignedToId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only submit cost for issues assigned to you.");
        }
        if (record.costStatus() != CostStatus.DRAFT && record.costStatus() != null) {
            if (record.costStatus() == CostStatus.APPROVED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cost is already approved.");
            }
        }
        if (record.materialCost() == null && record.laborCost() == null && record.otherCost() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Enter at least one cost field before submitting.");
        }

        issueRepo.submitCost(id);
        IssueResponse submitted = get(id, propertyId);
        List<String> managerEmails = employeeRepo.findManagerEmailsByBusiness(record.propertyId());
        emailService.sendCostSubmittedNotification(managerEmails, submitted.title());
        return submitted;
    }

    public IssueResponse approveCost(UUID id, UUID propertyId, UUID managerId) {
        IssueRecord record = issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        if (record.costStatus() != CostStatus.SUBMITTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cost must be in SUBMITTED state to approve.");
        }

        issueRepo.approveCost(id, managerId);
        IssueResponse approved = get(id, propertyId);
        if (record.assignedToId() != null) {
            employeeRepo.findActiveById(record.assignedToId()).ifPresent(tech ->
                    emailService.sendCostApprovedNotification(tech.email(), approved.title()));
        }
        return approved;
    }

    public IssueResponse rejectCost(UUID id, UUID propertyId, CostRejectRequest req) {
        IssueRecord record = issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        if (record.costStatus() != CostStatus.SUBMITTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cost must be in SUBMITTED state to reject.");
        }

        issueRepo.rejectCost(id, req.reason());
        IssueResponse rejected = get(id, propertyId);
        if (record.assignedToId() != null) {
            employeeRepo.findActiveById(record.assignedToId()).ifPresent(tech ->
                    emailService.sendCostRejectedNotification(tech.email(), rejected.title(), req.reason()));
        }
        return rejected;
    }

    public NoteResponse addNote(UUID id, UUID propertyId, NoteCreateRequest req, UUID authorId) {
        issueRepo.findByIdAndProperty(id, propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        UUID noteId = issueRepo.addNote(id, authorId, req.body());
        return issueRepo.findNotesByIssue(id).stream()
                .filter(n -> n.id().equals(noteId))
                .map(NoteResponse::from)
                .findFirst()
                .orElseThrow();
    }

    private void validateStatusTransition(IssueRecord issue, IssueStatus next, String role, UUID userId) {
        IssueStatus current = issue.status();

        if (current == IssueStatus.COMPLETED || current == IssueStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Issue is already " + current.name().toLowerCase() + ".");
        }

        if ("TECHNICIAN".equals(role)) {
            if (issue.assignedToId() == null || !issue.assignedToId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You can only update issues assigned to you.");
            }
            if (next == IssueStatus.NEW || next == IssueStatus.ASSIGNED || next == IssueStatus.CANCELLED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Technicians cannot set status to " + next.name() + ".");
            }
        }

        if ("STAFF".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Staff cannot change issue status.");
        }
    }
}
