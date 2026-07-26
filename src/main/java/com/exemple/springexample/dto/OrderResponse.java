package com.exemple.springexample.dto;

import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.DeliveryMethod;
import com.exemple.springexample.model.OrderStatus;
import com.exemple.springexample.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        LocalDateTime createdAt,
        OrderStatus status,
        BigDecimal totalPrice,
        BigDecimal itemsPrice,
        BigDecimal deliveryPrice,
        DeliveryMethod deliveryMethod,
        String city,
        String deliveryAddress,
        String deliveryComment,
        String contactEmail,
        ContactMethod preferredContactMethod,
        PaymentMethod paymentMethod,
        String comment,
        CustomerResponse customer,
        List<OrderItemResponse> items
) {
}
