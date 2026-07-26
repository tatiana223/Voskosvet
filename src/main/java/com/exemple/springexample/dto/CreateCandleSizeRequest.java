package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateCandleSizeRequest(
        @NotNull(message = "Размер обязателен")
        @Positive(message = "Размер должен быть больше нуля")
        Integer valueCm
) {
}
