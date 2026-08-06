package com.fixmyroom.rent;

import com.fixmyroom.common.JwtTenant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rent")
@PreAuthorize("hasRole('MANAGER')")
public class RentPaymentController {

    private final RentPaymentRepository rentRepo;

    public RentPaymentController(RentPaymentRepository rentRepo) {
        this.rentRepo = rentRepo;
    }

    @GetMapping
    public List<RentPaymentResponse> list(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal Jwt jwt) {
        return rentRepo.findByBusiness(businessId(jwt), year, month)
                .stream().map(RentPaymentResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<RentPaymentResponse> create(
            @RequestBody RentPaymentRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        if (req.tenantId() == null || req.tenantId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tenantId is required.");
        }
        UUID id = rentRepo.create(businessId(jwt), req);
        RentPaymentRecord created = rentRepo.findByIdAndBusiness(id, businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payment creation failed."));
        return ResponseEntity.status(HttpStatus.CREATED).body(RentPaymentResponse.from(created));
    }

    @PutMapping("/{id}")
    public RentPaymentResponse update(
            @PathVariable UUID id,
            @RequestBody RentPaymentRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        rentRepo.findByIdAndBusiness(id, businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found."));
        rentRepo.update(id, req);
        return rentRepo.findByIdAndBusiness(id, businessId(jwt))
                .map(RentPaymentResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found."));
    }

    private UUID businessId(Jwt jwt) {
        return JwtTenant.businessId(jwt);
    }
}
