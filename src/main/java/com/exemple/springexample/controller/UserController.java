package com.exemple.springexample.controller;

import com.exemple.springexample.dto.AuthResponse;
import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.dto.UpdateProfileRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.service.AuthService;
import com.exemple.springexample.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final OrderService orderService;
    private final AuthService authService;

    @GetMapping("/me")
    public AuthResponse getCurrentUser(@AuthenticationPrincipal Customer customer) {
        return authService.getProfile(customer);
    }

    @PutMapping("/me")
    public AuthResponse updateCurrentUser(
            @AuthenticationPrincipal Customer customer,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return authService.updateProfile(customer, request);
    }

    @GetMapping("/me/orders")
    public List<OrderResponse> getCurrentUserOrders(@AuthenticationPrincipal Customer customer) {
        return orderService.getCurrentCustomerOrders(customer);
    }
}
