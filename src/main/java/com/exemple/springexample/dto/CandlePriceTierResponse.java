package com.exemple.springexample.dto;

import java.math.BigDecimal;

public record CandlePriceTierResponse(
        Integer quantity,
        BigDecimal unitPrice
) {
}

