package com.exemple.springexample.controller;

import com.exemple.springexample.dto.AuthResponse;
import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final OrderService orderService;

    @GetMapping("/me")
    public AuthResponse getCurrentUser(@AuthenticationPrincipal Customer customer) {
        return new AuthResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getRole(),
                null
        );
    }

    @GetMapping("/me/orders")
    public List<OrderResponse> getCurrentUserOrders(@AuthenticationPrincipal Customer customer) {
        return orderService.getCurrentCustomerOrders(customer);
    }
}
