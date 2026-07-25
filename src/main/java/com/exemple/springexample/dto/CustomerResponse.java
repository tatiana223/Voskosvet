package com.exemple.springexample.dto;

import com.exemple.springexample.entity.Role;

public record CustomerResponse(
        Long id,
        String fullName,
        String phone,
        String email,
        Role role
) {
}