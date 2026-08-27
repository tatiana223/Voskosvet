package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateManagerRequest(
        @NotBlank(message = "Имя обязательно")
        @Size(max = 100, message = "Имя слишком длинное")
        String firstName,

        @NotBlank(message = "Фамилия обязательна")
        @Size(max = 100, message = "Фамилия слишком длинная")
        String lastName,

        @NotBlank(message = "Логин обязателен")
        @Size(min = 3, max = 100, message = "Логин должен содержать от 3 до 100 символов")
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "В логине допустимы латинские буквы, цифры, точка, дефис и подчёркивание")
        String login,

        @NotBlank(message = "Пароль обязателен")
        @Size(min = 6, max = 100, message = "Пароль должен содержать от 6 до 100 символов")
        String password
) {
}
