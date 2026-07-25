package com.exemple.springexample.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Имя обязательно")
    private String fullName;

    @NotBlank(message = "Телефон обязателен")
    private String phone;

    @Email(message = "Некорректный email")
    @NotBlank(message = "Email обязателен")
    private String email;

    @Size(min = 6, message = "Пароль должен быть не короче 6 символов")
    @NotBlank(message = "Пароль обязателен")
    private String password;
}