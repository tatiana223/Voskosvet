package com.exemple.springexample.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CandlePriceTierRequest(
        @NotNull @Min(2) Integer quantity,
        @NotNull @Positive BigDecimal unitPrice,
        String imageUrl
) {
}
