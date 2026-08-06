package com.fixmyroom.tenant;

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
@RequestMapping("/api/tenants")
@PreAuthorize("hasRole('MANAGER')")
public class TenantController {

    private final TenantRepository tenantRepo;

    public TenantController(TenantRepository tenantRepo) {
        this.tenantRepo = tenantRepo;
    }

    @GetMapping
    public List<TenantResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return tenantRepo.findActiveByBusiness(businessId(jwt))
                .stream().map(TenantResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<TenantResponse> create(
            @RequestBody TenantRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        if (req.name() == null || req.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant name is required.");
        }
        UUID id = tenantRepo.create(businessId(jwt), req);
        TenantRecord created = tenantRepo.findByIdAndBusiness(id, businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Tenant creation failed."));
        return ResponseEntity.status(HttpStatus.CREATED).body(TenantResponse.from(created));
    }

    @PutMapping("/{id}")
    public TenantResponse update(
            @PathVariable UUID id,
            @RequestBody TenantRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        tenantRepo.findByIdAndBusiness(id, businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found."));
        tenantRepo.update(id, req);
        return tenantRepo.findByIdAndBusiness(id, businessId(jwt))
                .map(TenantResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found."));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        tenantRepo.findByIdAndBusiness(id, businessId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found."));
        tenantRepo.deactivate(id);
    }

    private UUID businessId(Jwt jwt) {
        return JwtTenant.businessId(jwt);
    }
}
