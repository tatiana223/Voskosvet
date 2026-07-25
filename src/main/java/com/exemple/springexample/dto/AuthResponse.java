package com.exemple.springexample.dto;

import com.exemple.springexample.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String token;
}