package com.exemple.springexample.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long candleId,
        String candleName,
        Integer quantity,
        Integer packageSize,
        Integer boxQuantity,
        BigDecimal priceAtPurchase,
        BigDecimal subtotal
) {
}
