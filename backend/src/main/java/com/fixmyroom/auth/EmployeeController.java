package com.fixmyroom.auth;

import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    public EmployeeController(EmployeeRepository employeeRepository, AuthService authService) {
        this.employeeRepository = employeeRepository;
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    List<EmployeeTeamMember> listAllEmployees(@AuthenticationPrincipal Jwt jwt) {
        UUID hotelId = UUID.fromString(jwt.getClaimAsString("hotel_id"));
        return employeeRepository.findAllByHotel(hotelId);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('MANAGER')")
    List<EmployeeListResponse> listTechnicians(@AuthenticationPrincipal Jwt jwt) {
        UUID hotelId = UUID.fromString(jwt.getClaimAsString("hotel_id"));
        return employeeRepository.findTechniciansByProperty(hotelId);
    }

    @PatchMapping("/{id}/password")
    @PreAuthorize("hasRole('MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody ResetPasswordRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID hotelId = UUID.fromString(jwt.getClaimAsString("hotel_id"));
        authService.resetEmployeePassword(id, hotelId, request.newPassword());
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    void addEmployee(@Valid @RequestBody AddEmployeeRequest request, @AuthenticationPrincipal Jwt jwt) {
        UUID hotelId = UUID.fromString(jwt.getClaimAsString("hotel_id"));
        UUID managerId = UUID.fromString(jwt.getSubject());
        authService.addEmployee(request, hotelId, managerId);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('MANAGER')")
    BulkUploadResult bulkAddEmployees(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) throws IOException {

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty.");
        }

        UUID hotelId = UUID.fromString(jwt.getClaimAsString("hotel_id"));
        UUID managerId = UUID.fromString(jwt.getSubject());

        DataFormatter fmt = new DataFormatter();
        List<BulkUploadResult.RowError> errors = new ArrayList<>();
        int added = 0;

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null) continue;

                String name     = cell(fmt, row, 0);
                String email    = cell(fmt, row, 1);
                String roleStr  = cell(fmt, row, 2).toUpperCase();
                String phone    = cell(fmt, row, 3);
                String password = cell(fmt, row, 4);

                if (name.isBlank() && email.isBlank()) continue;

                if (name.isBlank()) {
                    errors.add(new BulkUploadResult.RowError(rowIdx + 1, email, "Name is required."));
                    continue;
                }
                if (email.isBlank()) {
                    errors.add(new BulkUploadResult.RowError(rowIdx + 1, "(empty)", "Email is required."));
                    continue;
                }
                if (password.length() < 8) {
                    errors.add(new BulkUploadResult.RowError(rowIdx + 1, email, "Password must be at least 8 characters."));
                    continue;
                }

                EmployeeRole role;
                try {
                    role = EmployeeRole.valueOf(roleStr);
                    if (role == EmployeeRole.MANAGER) throw new IllegalArgumentException();
                } catch (IllegalArgumentException e) {
                    errors.add(new BulkUploadResult.RowError(rowIdx + 1, email,
                            "Role must be STAFF or TECHNICIAN (got: " + cell(fmt, row, 2) + ")."));
                    continue;
                }

                try {
                    authService.addEmployee(
                            new AddEmployeeRequest(
                                    name.trim(), role,
                                    email.trim().toLowerCase(),
                                    password,
                                    phone.isBlank() ? null : phone.trim()),
                            hotelId, managerId);
                    added++;
                } catch (Exception e) {
                    errors.add(new BulkUploadResult.RowError(rowIdx + 1, email, e.getMessage()));
                }
            }
        }

        return new BulkUploadResult(added, errors.size(), errors);
    }

    private static String cell(DataFormatter fmt, Row row, int col) {
        var cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cell == null ? "" : fmt.formatCellValue(cell).trim();
    }
}
