package com.fixmyroom.auth;

import java.util.List;
import java.util.UUID;

public record EmployeeListResponse(UUID id, String name, List<String> specialties) {}
