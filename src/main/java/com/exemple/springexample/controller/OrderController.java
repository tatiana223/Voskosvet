package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CreateOrderRequest;
import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Оформление заказов")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Создать заказ")
    @PostMapping
    public OrderResponse createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal Customer customer
    ) {
        return orderService.createOrder(request, customer);
    }

    @Operation(summary = "Отследить заказ по номеру и телефону")
    @GetMapping("/{id}/tracking")
    public OrderResponse trackOrder(
            @PathVariable Long id,
            @RequestParam String phone
    ) {
        return orderService.trackOrder(id, phone);
    }

    @Operation(summary = "Найти заказы по телефону и фамилии")
    @GetMapping("/tracking")
    public java.util.List<OrderResponse> trackOrders(
            @RequestParam String phone,
            @RequestParam String surname
    ) {
        return orderService.trackOrders(phone, surname);
    }
}
