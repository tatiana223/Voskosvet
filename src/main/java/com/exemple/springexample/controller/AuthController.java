package com.exemple.springexample.controller;

import com.exemple.springexample.dto.AuthResponse;
import com.exemple.springexample.dto.EmailRequest;
import com.exemple.springexample.dto.LoginRequest;
import com.exemple.springexample.dto.MessageResponse;
import com.exemple.springexample.dto.RegisterRequest;
import com.exemple.springexample.service.AuthService;
import com.exemple.springexample.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Регистрация и вход")
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return new MessageResponse("Проверьте почту и подтвердите email");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/verify-email")
    public MessageResponse verifyEmail(@RequestParam String token) {
        emailVerificationService.verify(token);
        return new MessageResponse("Email подтверждён");
    }

    @PostMapping("/resend-verification")
    public MessageResponse resendVerification(@Valid @RequestBody EmailRequest request) {
        authService.resendVerification(request.email());
        return new MessageResponse("Если аккаунт ожидает подтверждения, письмо отправлено");
    }
}
