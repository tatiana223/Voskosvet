package com.exemple.springexample.dto;

import com.exemple.springexample.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Статус заказа обязателен")
        OrderStatus status
) {
}
