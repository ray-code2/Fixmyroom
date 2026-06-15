package com.fixmyroom.leads;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leads")
public class LeadController {
    private final LeadService leadService;
    private final String exportKey;

    public LeadController(LeadService leadService,
                          @Value("${app.admin.export-key:fmr-admin-2026}") String exportKey) {
        this.leadService = leadService;
        this.exportKey = exportKey;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    LeadResponse createLead(@Valid @RequestBody LeadRequest request) {
        return leadService.createLead(request);
    }

    @GetMapping("/export")
    ResponseEntity<byte[]> exportLeads(@RequestParam("key") String key) {
        if (!exportKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE)
                    .body("Invalid export key.".getBytes());
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"database potential client.xlsx\"")
                .body(leadService.exportAsXlsx());
    }
}
