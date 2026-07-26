package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateOrderItemRequest(
        @NotNull(message = "ID свечи обязателен")
        Long candleId,

        @NotNull(message = "Количество обязательно")
        @Positive(message = "Количество должно быть больше 0")
        Integer quantity,

        @NotNull
        @Positive
        Integer packageSize
) {
}
