package com.exemple.springexample.service;

import com.exemple.springexample.dto.PaymentResponse;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Order;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.model.PaymentMethod;
import com.exemple.springexample.model.PaymentStatus;
import com.exemple.springexample.repository.OrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class YooKassaPaymentService {

    private static final String API_URL = "https://api.yookassa.ru/v3/payments";

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${yookassa.shop-id:}")
    private String shopId;

    @Value("${yookassa.secret-key:}")
    private String secretKey;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public PaymentResponse startPayment(Long orderId, String phone) {
        ensureConfigured();
        Order order = getAccessibleOrder(orderId, phone);

        if (order.getPaymentMethod() != PaymentMethod.CARD_ONLINE) {
            throw new BadRequestException("Для этого заказа выбрана не онлайн-оплата");
        }
        if (order.getPaymentStatus() == PaymentStatus.SUCCEEDED) {
            return new PaymentResponse(orderId, PaymentStatus.SUCCEEDED, null);
        }

        JsonNode payment = order.getExternalPaymentId() == null
                ? createPayment(order)
                : getPayment(order.getExternalPaymentId());

        if ("canceled".equals(payment.path("status").asText())) {
            payment = createPayment(order);
        }

        order.setExternalPaymentId(payment.path("id").asText());
        applyVerifiedStatus(order, payment);
        orderRepository.save(order);

        String confirmationUrl = payment.path("confirmation").path("confirmation_url").asText(null);
        if (order.getPaymentStatus() == PaymentStatus.PENDING && confirmationUrl == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "ЮKassa не вернула ссылку на оплату");
        }

        return new PaymentResponse(orderId, order.getPaymentStatus(), confirmationUrl);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getStatus(Long orderId, String phone) {
        Order order = getAccessibleOrder(orderId, phone);
        return new PaymentResponse(orderId, order.getPaymentStatus(), null);
    }

    @Transactional
    public void processNotification(JsonNode notification) {
        String paymentId = notification.path("object").path("id").asText(null);
        if (paymentId == null) {
            throw new BadRequestException("Некорректное уведомление об оплате");
        }

        Order order = orderRepository.findByExternalPaymentId(paymentId)
                .orElseThrow(() -> new NotFoundException("Заказ для платежа не найден"));
        JsonNode verifiedPayment = getPayment(paymentId);

        String metadataOrderId = verifiedPayment.path("metadata").path("order_id").asText();
        String paymentAmount = verifiedPayment.path("amount").path("value").asText();
        if (!String.valueOf(order.getId()).equals(metadataOrderId)
                || order.getTotalPrice().compareTo(new java.math.BigDecimal(paymentAmount)) != 0) {
            throw new BadRequestException("Данные платежа не совпадают с заказом");
        }

        applyVerifiedStatus(order, verifiedPayment);
        orderRepository.save(order);
    }

    private Order getAccessibleOrder(Long orderId, String phone) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));
        if (!Customer.normalizePhone(phone).equals(order.getCustomer().getNormalizedPhone())) {
            throw new NotFoundException("Заказ не найден");
        }
        return order;
    }

    private JsonNode createPayment(Order order) {
        String returnUrl = frontendUrl.replaceAll("/+$", "")
                + "/payment/result?orderId=" + order.getId();
        Map<String, Object> body = Map.of(
                "amount", Map.of(
                        "value", order.getTotalPrice()
                                .setScale(2, java.math.RoundingMode.HALF_UP)
                                .toPlainString(),
                        "currency", "RUB"
                ),
                "capture", true,
                "confirmation", Map.of("type", "redirect", "return_url", returnUrl),
                "description", "Заказ №" + order.getId(),
                "metadata", Map.of("order_id", String.valueOf(order.getId()))
        );
        return send("POST", API_URL, body, UUID.randomUUID().toString());
    }

    private JsonNode getPayment(String paymentId) {
        return send("GET", API_URL + "/" + URLEncoder.encode(paymentId, StandardCharsets.UTF_8), null, null);
    }

    private JsonNode send(String method, String url, Object body, String idempotenceKey) {
        try {
            HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(url))
                    .header("Authorization", basicAuth())
                    .header("Accept", "application/json");
            if (idempotenceKey != null) {
                request.header("Idempotence-Key", idempotenceKey);
            }
            if (body != null) {
                request.header("Content-Type", "application/json")
                        .method(method, HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
            } else {
                request.method(method, HttpRequest.BodyPublishers.noBody());
            }

            HttpResponse<String> response = httpClient.send(
                    request.build(),
                    HttpResponse.BodyHandlers.ofString()
            );
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "ЮKassa временно не приняла запрос"
                );
            }
            return objectMapper.readTree(response.body());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Ошибка ответа ЮKassa", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Запрос к ЮKassa прерван", exception);
        }
    }

    private void applyVerifiedStatus(Order order, JsonNode payment) {
        String status = payment.path("status").asText();
        if ("succeeded".equals(status) && payment.path("paid").asBoolean(false)) {
            order.setPaymentStatus(PaymentStatus.SUCCEEDED);
            if (order.getPaidAt() == null) {
                order.setPaidAt(LocalDateTime.now());
            }
        } else if ("canceled".equals(status)) {
            order.setPaymentStatus(PaymentStatus.CANCELED);
        } else {
            order.setPaymentStatus(PaymentStatus.PENDING);
        }
    }

    private String basicAuth() {
        return "Basic " + Base64.getEncoder().encodeToString(
                (shopId + ":" + secretKey).getBytes(StandardCharsets.UTF_8)
        );
    }

    public boolean isConfigured() {
        return shopId != null && !shopId.isBlank()
                && secretKey != null && !secretKey.isBlank();
    }

    private void ensureConfigured() {
        if (shopId.isBlank() || secretKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Онлайн-оплата пока не настроена"
            );
        }
    }
}
