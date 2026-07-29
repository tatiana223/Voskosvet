package com.exemple.springexample.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailRequest(
        @NotBlank(message = "Email обязателен")
        @Email(message = "Некорректный email")
        String email
) {
}
