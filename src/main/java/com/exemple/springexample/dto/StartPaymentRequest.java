package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotBlank;

public record StartPaymentRequest(
        @NotBlank String phone
) {
}

