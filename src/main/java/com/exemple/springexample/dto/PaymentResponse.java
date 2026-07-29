package com.exemple.springexample.dto;

import com.exemple.springexample.model.PaymentStatus;

public record PaymentResponse(
        Long orderId,
        PaymentStatus status,
        String confirmationUrl
) {
}

