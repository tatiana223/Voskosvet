package com.exemple.springexample.dto;

import jakarta.validation.constraints.Size;

public record UpdateCustomerBlockRequest(
        boolean blocked,
        @Size(max = 500, message = "Причина блокировки не должна превышать 500 символов")
        String reason
) {
}
