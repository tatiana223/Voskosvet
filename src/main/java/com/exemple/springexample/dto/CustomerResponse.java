package com.exemple.springexample.dto;

import com.exemple.springexample.entity.Role;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String fullName,
        String phone,
        String email,
        Role role,
        boolean primaryAdmin,
        boolean blocked,
        String blockedReason,
        LocalDateTime blockedAt
) {
}
