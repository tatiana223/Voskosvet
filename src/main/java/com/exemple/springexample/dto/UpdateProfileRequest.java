package com.exemple.springexample.dto;

import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.DeliveryMethod;
import com.exemple.springexample.model.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank(message = "Имя и фамилия обязательны")
        String fullName,

        @NotBlank(message = "Телефон обязателен")
        String phone,

        @Email(message = "Некорректный email")
        @NotBlank(message = "Email обязателен")
        String email,

        String city,
        String deliveryAddress,
        ContactMethod preferredContactMethod,
        DeliveryMethod defaultDeliveryMethod,
        PaymentMethod defaultPaymentMethod
) {
}
