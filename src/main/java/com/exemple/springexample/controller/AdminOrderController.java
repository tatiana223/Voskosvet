package com.exemple.springexample.controller;

import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.dto.PageResponse;
import com.exemple.springexample.dto.UpdateOrderStatusRequest;
import com.exemple.springexample.model.OrderStatus;
import com.exemple.springexample.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Orders", description = "Управление заказами")
@SecurityRequirement(name = "basicAuth")
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "Получить страницу заказов")
    @GetMapping
    public PageResponse<OrderResponse> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return orderService.getOrders(status, search, page, size);
    }

    @Operation(summary = "Получить заказ по id")
    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @Operation(summary = "Изменить статус заказа")
    @PatchMapping("/{id}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(id, request);
    }
}