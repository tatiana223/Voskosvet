package com.exemple.springexample.controller;

import com.exemple.springexample.dto.AuthResponse;
import com.exemple.springexample.dto.LoginRequest;
import com.exemple.springexample.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Вход администратора")
public class AuthController {

    private final AuthService authService;
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
