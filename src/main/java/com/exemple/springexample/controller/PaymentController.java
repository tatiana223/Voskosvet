package com.exemple.springexample.controller;

import com.exemple.springexample.dto.PaymentResponse;
import com.exemple.springexample.dto.PaymentConfigResponse;
import com.exemple.springexample.dto.StartPaymentRequest;
import com.exemple.springexample.service.YooKassaPaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final YooKassaPaymentService paymentService;

    @GetMapping("/config")
    public PaymentConfigResponse config() {
        return new PaymentConfigResponse(paymentService.isConfigured());
    }

    @PostMapping("/orders/{orderId}")
    public PaymentResponse start(
            @PathVariable Long orderId,
            @Valid @RequestBody StartPaymentRequest request
    ) {
        return paymentService.startPayment(orderId, request.phone());
    }

    @GetMapping("/orders/{orderId}")
    public PaymentResponse status(
            @PathVariable Long orderId,
            @RequestParam String phone
    ) {
        return paymentService.getStatus(orderId, phone);
    }

    @PostMapping("/yookassa/webhook")
    public ResponseEntity<Void> webhook(@RequestBody JsonNode notification) {
        paymentService.processNotification(notification);
        return ResponseEntity.ok().build();
    }
}
