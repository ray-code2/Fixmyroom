package com.fixmyroom.auth;

import java.util.UUID;

public record EmployeeTeamMember(UUID id, String name, String role, String email) {}
