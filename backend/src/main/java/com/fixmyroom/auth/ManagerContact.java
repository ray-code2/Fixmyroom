package com.fixmyroom.auth;

import java.util.UUID;

/** Who a staff/technician reports to — shown on the staff dashboard. */
public record ManagerContact(UUID id, String name, String email, String phone) {}
