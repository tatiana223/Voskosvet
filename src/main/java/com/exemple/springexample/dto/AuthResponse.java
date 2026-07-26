package com.exemple.springexample.dto;

import com.exemple.springexample.entity.Role;
import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.DeliveryMethod;
import com.exemple.springexample.model.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String city;
    private String deliveryAddress;
    private ContactMethod preferredContactMethod;
    private DeliveryMethod defaultDeliveryMethod;
    private PaymentMethod defaultPaymentMethod;
    private Role role;
    private String token;
}
