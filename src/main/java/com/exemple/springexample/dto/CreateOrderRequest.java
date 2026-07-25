package com.exemple.springexample.dto;

import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.DeliveryMethod;
import com.exemple.springexample.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Имя покупателя обязательно")
        String customerFullName,

        @NotBlank(message = "Телефон обязателен")
        String customerPhone,

        @Email(message = "Некорректный email")
        String customerEmail,

        @NotNull(message = "Способ доставки обязателен")
        DeliveryMethod deliveryMethod,

        @PositiveOrZero(message = "Стоимость доставки не может быть отрицательной")
        BigDecimal deliveryPrice,

        String city,

        String deliveryAddress,

        String deliveryComment,

        ContactMethod preferredContactMethod,

        @NotNull(message = "Способ оплаты обязателен")
        PaymentMethod paymentMethod,

        String comment,

        @NotEmpty(message = "В заказе должна быть хотя бы одна позиция")
        List<@Valid CreateOrderItemRequest> items
) {

    @AssertTrue(message = "Для выбранного способа доставки нужно указать город и адрес")
    public boolean isDeliveryAddressValid() {
        if (deliveryMethod == null || deliveryMethod == DeliveryMethod.PICKUP) {
            return true;
        }

        return city != null
                && !city.isBlank()
                && deliveryAddress != null
                && !deliveryAddress.isBlank();
    }
}
