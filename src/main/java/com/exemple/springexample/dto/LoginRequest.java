package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Логин обязателен")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    private String password;
}
