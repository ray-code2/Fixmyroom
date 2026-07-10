package com.fixmyroom.auth;

import com.fixmyroom.issue.IssueCategory;
import com.fixmyroom.issue.IssuePriority;
import com.fixmyroom.issue.IssueRepository;
import com.fixmyroom.issue.IssueStatus;
import com.fixmyroom.room.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
public class DemoDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    // ── Generic demo property (fixed IDs — idempotent) ───────────────────────

    static final UUID HOTEL_ID      = UUID.fromString("11111111-1111-1111-1111-111111111111");
    static final UUID MANAGER_ID    = UUID.fromString("22222222-2222-2222-2222-222222222222");
    static final UUID STAFF_ID      = UUID.fromString("33333333-3333-3333-3333-333333333333");
    static final UUID TECHNICIAN_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");

    private static final UUID ROOM_101 = UUID.fromString("a1111111-0000-0000-0000-000000000001");
    private static final UUID ROOM_102 = UUID.fromString("a1111111-0000-0000-0000-000000000002");
    private static final UUID ROOM_201 = UUID.fromString("a1111111-0000-0000-0000-000000000003");
    private static final UUID ROOM_202 = UUID.fromString("a1111111-0000-0000-0000-000000000004");
    private static final UUID ROOM_301 = UUID.fromString("a1111111-0000-0000-0000-000000000005");
    private static final UUID ROOM_302 = UUID.fromString("a1111111-0000-0000-0000-000000000006");
    private static final UUID ROOM_401 = UUID.fromString("a1111111-0000-0000-0000-000000000007");
    private static final UUID VILLA_1  = UUID.fromString("a1111111-0000-0000-0000-000000000008");
    private static final UUID VILLA_2  = UUID.fromString("a1111111-0000-0000-0000-000000000009");
    private static final UUID SUITE_1  = UUID.fromString("a1111111-0000-0000-0000-000000000010");

    private static final UUID ISSUE_1  = UUID.fromString("b1111111-0000-0000-0000-000000000001");
    private static final UUID ISSUE_2  = UUID.fromString("b1111111-0000-0000-0000-000000000002");
    private static final UUID ISSUE_3  = UUID.fromString("b1111111-0000-0000-0000-000000000003");
    private static final UUID ISSUE_4  = UUID.fromString("b1111111-0000-0000-0000-000000000004");
    private static final UUID ISSUE_5  = UUID.fromString("b1111111-0000-0000-0000-000000000005");
    private static final UUID ISSUE_6  = UUID.fromString("b1111111-0000-0000-0000-000000000006");
    private static final UUID ISSUE_7  = UUID.fromString("b1111111-0000-0000-0000-000000000007");
    private static final UUID ISSUE_8  = UUID.fromString("b1111111-0000-0000-0000-000000000008");
    private static final UUID ISSUE_9  = UUID.fromString("b1111111-0000-0000-0000-000000000009");
    private static final UUID ISSUE_10 = UUID.fromString("b1111111-0000-0000-0000-000000000010");

    // ── Sunniress hotel — Raymond's account ──────────────────────────────────

    private static final UUID SUN_HOTEL_ID   = UUID.fromString("cc000001-0000-0000-0000-000000000001");
    private static final UUID SUN_MANAGER_ID = UUID.fromString("cc000001-0000-0000-0000-000000000002");

    // Staff
    private static final UUID SUN_STAFF_1 = UUID.fromString("cc000001-0000-0000-0000-000000000010");
    private static final UUID SUN_STAFF_2 = UUID.fromString("cc000001-0000-0000-0000-000000000011");
    private static final UUID SUN_STAFF_3 = UUID.fromString("cc000001-0000-0000-0000-000000000012");

    // Technicians
    private static final UUID SUN_TECH_1  = UUID.fromString("cc000001-0000-0000-0000-000000000020");
    private static final UUID SUN_TECH_2  = UUID.fromString("cc000001-0000-0000-0000-000000000021");
    private static final UUID SUN_TECH_3  = UUID.fromString("cc000001-0000-0000-0000-000000000022");

    // Rooms
    private static final UUID SUN_R_101 = UUID.fromString("cc000001-0000-0000-0001-000000000001");
    private static final UUID SUN_R_102 = UUID.fromString("cc000001-0000-0000-0001-000000000002");
    private static final UUID SUN_R_103 = UUID.fromString("cc000001-0000-0000-0001-000000000003");
    private static final UUID SUN_R_104 = UUID.fromString("cc000001-0000-0000-0001-000000000004");
    private static final UUID SUN_R_105 = UUID.fromString("cc000001-0000-0000-0001-000000000005");
    private static final UUID SUN_R_201 = UUID.fromString("cc000001-0000-0000-0001-000000000006");
    private static final UUID SUN_R_202 = UUID.fromString("cc000001-0000-0000-0001-000000000007");
    private static final UUID SUN_R_203 = UUID.fromString("cc000001-0000-0000-0001-000000000008");
    private static final UUID SUN_R_204 = UUID.fromString("cc000001-0000-0000-0001-000000000009");
    private static final UUID SUN_R_205 = UUID.fromString("cc000001-0000-0000-0001-000000000010");
    private static final UUID SUN_R_301 = UUID.fromString("cc000001-0000-0000-0001-000000000011");
    private static final UUID SUN_R_302 = UUID.fromString("cc000001-0000-0000-0001-000000000012");

    // Issues
    private static final UUID SUN_ISSUE_1 = UUID.fromString("cc000001-0000-0000-0002-000000000001");
    private static final UUID SUN_ISSUE_2 = UUID.fromString("cc000001-0000-0000-0002-000000000002");
    private static final UUID SUN_ISSUE_3 = UUID.fromString("cc000001-0000-0000-0002-000000000003");
    private static final UUID SUN_ISSUE_4 = UUID.fromString("cc000001-0000-0000-0002-000000000004");
    private static final UUID SUN_ISSUE_5 = UUID.fromString("cc000001-0000-0000-0002-000000000005");
    private static final UUID SUN_ISSUE_6 = UUID.fromString("cc000001-0000-0000-0002-000000000006");
    private static final UUID SUN_ISSUE_7 = UUID.fromString("cc000001-0000-0000-0002-000000000007");

    private final EmployeeRepository employeeRepo;
    private final RoomRepository roomRepo;
    private final IssueRepository issueRepo;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedEnabled;
    private final String demoPassword;

    public DemoDataInitializer(
            EmployeeRepository employeeRepo,
            RoomRepository roomRepo,
            IssueRepository issueRepo,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.enabled:true}") boolean seedEnabled,
            @Value("${app.seed.demo-password:Password123!}") String demoPassword
    ) {
        this.employeeRepo = employeeRepo;
        this.roomRepo = roomRepo;
        this.issueRepo = issueRepo;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) return;

        Instant now = Instant.now();

        seedDemoProperty(now);
        seedSunniress(now);
    }

    // ── Generic demo property ─────────────────────────────────────────────────

    private void seedDemoProperty(Instant now) {
        if (!employeeRepo.businessExists(HOTEL_ID)) {
            employeeRepo.createBusiness(HOTEL_ID, "FMR Demo Boutique Property",
                    "12 Harbor Lane, Demo City", "Asia/Bangkok", now);
            log.info("Seeded demo property {}", HOTEL_ID);
        }

        seedEmployee(MANAGER_ID,    HOTEL_ID, null,       "Maya Chen",        EmployeeRole.MANAGER,    "+66000000001", "manager@fixmyroom.test",    now);
        seedEmployee(STAFF_ID,      HOTEL_ID, MANAGER_ID, "Lin Housekeeping", EmployeeRole.STAFF,      "+66000000002", "staff@fixmyroom.test",      now);
        seedEmployee(TECHNICIAN_ID, HOTEL_ID, MANAGER_ID, "Arun Technician",  EmployeeRole.TECHNICIAN, "+66000000003", "technician@fixmyroom.test", now);

        if (!roomRepo.existsByProperty(HOTEL_ID)) {
            seedRoom(ROOM_101, HOTEL_ID, "101",     "1", "Standard");
            seedRoom(ROOM_102, HOTEL_ID, "102",     "1", "Standard");
            seedRoom(ROOM_201, HOTEL_ID, "201",     "2", "Deluxe");
            seedRoom(ROOM_202, HOTEL_ID, "202",     "2", "Deluxe");
            seedRoom(ROOM_301, HOTEL_ID, "301",     "3", "Superior");
            seedRoom(ROOM_302, HOTEL_ID, "302",     "3", "Superior");
            seedRoom(ROOM_401, HOTEL_ID, "401",     "4", "Junior Suite");
            seedRoom(VILLA_1,  HOTEL_ID, "Villa 1", "G", "Villa");
            seedRoom(VILLA_2,  HOTEL_ID, "Villa 2", "G", "Villa");
            seedRoom(SUITE_1,  HOTEL_ID, "Suite 1", "5", "Penthouse Suite");
            log.info("Seeded 10 demo units for FMR Demo property");
        }

        if (!issueRepo.issueExists(ISSUE_1)) {
            Instant d1 = now.minus(3, ChronoUnit.DAYS);
            Instant d2 = now.minus(2, ChronoUnit.DAYS);
            Instant d3 = now.minus(1, ChronoUnit.DAYS);

            issueRepo.seedIssue(ISSUE_1, HOTEL_ID, ROOM_301,
                    "AC unit not cooling", "Guest reports room temperature stays above 28°C even at max setting.",
                    IssueCategory.HVAC, IssuePriority.URGENT, IssueStatus.IN_PROGRESS,
                    STAFF_ID, TECHNICIAN_ID, d1);
            issueRepo.seedIssue(ISSUE_2, HOTEL_ID, VILLA_1,
                    "Bathroom tap leaking", "Hot-water tap drips constantly. Floor tile cracking from moisture.",
                    IssueCategory.PLUMBING, IssuePriority.HIGH, IssueStatus.ASSIGNED,
                    STAFF_ID, TECHNICIAN_ID, d1);
            issueRepo.seedIssue(ISSUE_3, HOTEL_ID, ROOM_201,
                    "Door lock unresponsive", "Key card reader shows red on first swipe. Guest had to try 4 times.",
                    IssueCategory.LOCK_KEY, IssuePriority.HIGH, IssueStatus.NEW,
                    STAFF_ID, null, d2);
            issueRepo.seedIssue(ISSUE_4, HOTEL_ID, ROOM_102,
                    "Bedside lamp flickering", "Left bedside lamp flickers intermittently. Bulb replaced, still flickers.",
                    IssueCategory.ELECTRICAL, IssuePriority.MEDIUM, IssueStatus.WAITING_PARTS,
                    STAFF_ID, TECHNICIAN_ID, d2);
            issueRepo.seedIssue(ISSUE_5, HOTEL_ID, ROOM_401,
                    "TV remote not working", "Remote unresponsive. Batteries replaced. Likely IR sensor issue.",
                    IssueCategory.APPLIANCE, IssuePriority.LOW, IssueStatus.ASSIGNED,
                    STAFF_ID, TECHNICIAN_ID, d2);
            issueRepo.seedIssue(ISSUE_6, HOTEL_ID, SUITE_1,
                    "Wardrobe door off hinge", "Left wardrobe door detached from top hinge. Guest reported.",
                    IssueCategory.FURNITURE, IssuePriority.MEDIUM, IssueStatus.NEW,
                    STAFF_ID, null, d3);
            issueRepo.seedIssue(ISSUE_7, HOTEL_ID, ROOM_101,
                    "Shower drain blocked", "Water drains very slowly. Hair trap cleaned, blockage deeper.",
                    IssueCategory.PLUMBING, IssuePriority.HIGH, IssueStatus.COMPLETED,
                    STAFF_ID, TECHNICIAN_ID, d3);
            issueRepo.seedIssue(ISSUE_8, HOTEL_ID, VILLA_2,
                    "Ceiling fan wobble", "Ceiling fan wobbles noticeably at medium and high speed. Safety risk.",
                    IssueCategory.ELECTRICAL, IssuePriority.URGENT, IssueStatus.NEW,
                    STAFF_ID, null, d3);
            issueRepo.seedIssue(ISSUE_9, HOTEL_ID, ROOM_202,
                    "Balcony railing loose", "Railing wobbles when touched. Flagged during routine inspection, awaiting assignment.",
                    IssueCategory.STRUCTURAL, IssuePriority.HIGH, IssueStatus.APPROVED,
                    STAFF_ID, null, d2);
            issueRepo.seedIssue(ISSUE_10, HOTEL_ID, ROOM_302,
                    "Extra pillows requested", "Logged as an issue by mistake — this is a guest amenity request, not a repair.",
                    IssueCategory.OTHER, IssuePriority.LOW, IssueStatus.DECLINED,
                    STAFF_ID, null, d3);

            log.info("Seeded 10 demo issues for FMR Demo property");
        }
    }

    // ── Sunniress — raymondtjahyadi00@gmail.com ───────────────────────────────

    private void seedSunniress(Instant now) {
        if (!employeeRepo.businessExists(SUN_HOTEL_ID)) {
            employeeRepo.createBusiness(SUN_HOTEL_ID, "Sunniress",
                    "Kuala Lumpur, Malaysia", "Asia/Kuala_Lumpur", now);
            log.info("Seeded Sunniress hotel {}", SUN_HOTEL_ID);
        }

        // Manager
        seedEmployee(SUN_MANAGER_ID, SUN_HOTEL_ID, null,
                "Raymond Tjahyadi", EmployeeRole.MANAGER,
                "+60123456789", "raymondtjahyadi00@gmail.com", now);

        // If the manager email was already taken by a different account, SUN_MANAGER_ID won't exist
        // and inserting staff that reference it would violate the FK constraint.
        if (!employeeRepo.employeeExists(SUN_MANAGER_ID)) {
            log.info("Sunniress seed skipped — manager email already registered under a different account ID");
            return;
        }

        // Staff
        seedEmployee(SUN_STAFF_1, SUN_HOTEL_ID, SUN_MANAGER_ID,
                "Ahmad Farid", EmployeeRole.STAFF,
                "+60111111001", "staff.farid@sunniress.com", now);
        seedEmployee(SUN_STAFF_2, SUN_HOTEL_ID, SUN_MANAGER_ID,
                "Nurul Ain Binti Hassan", EmployeeRole.STAFF,
                "+60111111002", "staff.nurul@sunniress.com", now);
        seedEmployee(SUN_STAFF_3, SUN_HOTEL_ID, SUN_MANAGER_ID,
                "Lim Wei Kang", EmployeeRole.STAFF,
                "+60111111003", "staff.lim@sunniress.com", now);

        // Technicians
        seedEmployee(SUN_TECH_1, SUN_HOTEL_ID, SUN_MANAGER_ID,
                "Raj Kumar Pillai", EmployeeRole.TECHNICIAN,
                "+60112222001", "tech.raj@sunniress.com", now);
        seedEmployee(SUN_TECH_2, SUN_HOTEL_ID, SUN_MANAGER_ID,
                "Zulkifli Bin Omar", EmployeeRole.TECHNICIAN,
                "+60112222002", "tech.zul@sunniress.com", now);
        seedEmployee(SUN_TECH_3, SUN_HOTEL_ID, SUN_MANAGER_ID,
                "Lee Chee Keong", EmployeeRole.TECHNICIAN,
                "+60112222003", "tech.lee@sunniress.com", now);

        // Rooms
        if (!roomRepo.existsByProperty(SUN_HOTEL_ID)) {
            seedRoom(SUN_R_101, SUN_HOTEL_ID, "101", "1", "Standard");
            seedRoom(SUN_R_102, SUN_HOTEL_ID, "102", "1", "Standard");
            seedRoom(SUN_R_103, SUN_HOTEL_ID, "103", "1", "Standard");
            seedRoom(SUN_R_104, SUN_HOTEL_ID, "104", "1", "Standard");
            seedRoom(SUN_R_105, SUN_HOTEL_ID, "105", "1", "Deluxe");
            seedRoom(SUN_R_201, SUN_HOTEL_ID, "201", "2", "Deluxe");
            seedRoom(SUN_R_202, SUN_HOTEL_ID, "202", "2", "Deluxe");
            seedRoom(SUN_R_203, SUN_HOTEL_ID, "203", "2", "Superior");
            seedRoom(SUN_R_204, SUN_HOTEL_ID, "204", "2", "Superior");
            seedRoom(SUN_R_205, SUN_HOTEL_ID, "205", "2", "Superior");
            seedRoom(SUN_R_301, SUN_HOTEL_ID, "301", "3", "Suite");
            seedRoom(SUN_R_302, SUN_HOTEL_ID, "302", "3", "Suite");
            log.info("Seeded 12 rooms for Sunniress");
        }

        // Sample issues — realistic mix of statuses
        if (!issueRepo.issueExists(SUN_ISSUE_1)) {
            Instant d1 = now.minus(4, ChronoUnit.DAYS);
            Instant d2 = now.minus(3, ChronoUnit.DAYS);
            Instant d3 = now.minus(2, ChronoUnit.DAYS);
            Instant d4 = now.minus(1, ChronoUnit.DAYS);

            issueRepo.seedIssue(SUN_ISSUE_1, SUN_HOTEL_ID, SUN_R_203,
                    "Air conditioning not cooling", "Guest in room 203 complains room stays at 29°C even on max cooling.",
                    IssueCategory.HVAC, IssuePriority.URGENT, IssueStatus.IN_PROGRESS,
                    SUN_STAFF_1, SUN_TECH_1, d1);

            issueRepo.seedIssue(SUN_ISSUE_2, SUN_HOTEL_ID, SUN_R_101,
                    "Bathroom tap dripping", "Hot water tap drips continuously. Guest reported water pooling on floor.",
                    IssueCategory.PLUMBING, IssuePriority.HIGH, IssueStatus.NEW,
                    SUN_STAFF_2, null, d2);

            issueRepo.seedIssue(SUN_ISSUE_3, SUN_HOTEL_ID, SUN_R_302,
                    "Main light bulb blown", "Ceiling light in room 302 not working. Guest using bedside lamp only.",
                    IssueCategory.LIGHTING, IssuePriority.MEDIUM, IssueStatus.COMPLETED,
                    SUN_STAFF_1, SUN_TECH_2, d3);

            issueRepo.seedIssue(SUN_ISSUE_4, SUN_HOTEL_ID, SUN_R_104,
                    "TV remote unresponsive", "Remote batteries replaced, still not working. Possible IR sensor fault.",
                    IssueCategory.APPLIANCE, IssuePriority.LOW, IssueStatus.NEW,
                    SUN_STAFF_3, null, d3);

            issueRepo.seedIssue(SUN_ISSUE_5, SUN_HOTEL_ID, SUN_R_205,
                    "Door lock jammed", "Electronic lock does not respond to key card. Guest cannot enter room.",
                    IssueCategory.LOCK_KEY, IssuePriority.URGENT, IssueStatus.ASSIGNED,
                    SUN_STAFF_2, SUN_TECH_3, d4);

            issueRepo.seedIssue(SUN_ISSUE_6, SUN_HOTEL_ID, SUN_R_201,
                    "Carpet stain — deep clean needed", "Large stain near window from previous guest. Regular cleaning not sufficient.",
                    IssueCategory.HOUSEKEEPING, IssuePriority.MEDIUM, IssueStatus.COMPLETED,
                    SUN_STAFF_1, SUN_TECH_2, d4);

            issueRepo.seedIssue(SUN_ISSUE_7, SUN_HOTEL_ID, SUN_R_105,
                    "Broken desk chair wheel", "One wheel detached from desk chair. Chair wobbles and is unsafe.",
                    IssueCategory.FURNITURE, IssuePriority.LOW, IssueStatus.WAITING_PARTS,
                    SUN_STAFF_3, SUN_TECH_1, d4);

            log.info("Seeded 7 sample issues for Sunniress");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void seedEmployee(UUID id, UUID hotelId, UUID managerId, String name, EmployeeRole role,
                               String phone, String email, Instant createdAt) {
        if (employeeRepo.employeeExists(id)) return;
        // Skip if email already registered by a manually created account
        if (employeeRepo.findActiveByEmail(email).isPresent()) {
            log.info("Seed skipped for {} — email already registered", email);
            return;
        }
        employeeRepo.createEmployee(id, hotelId, managerId, name, role, "en",
                phone, email, passwordEncoder.encode(demoPassword), createdAt);
        log.info("Seeded employee {} role={} email={}", id, role, email);
    }

    private void seedRoom(UUID id, UUID hotelId, String unitNumber, String floor, String unitType) {
        roomRepo.createRoom(id, hotelId, unitNumber, floor, unitType);
    }
}
