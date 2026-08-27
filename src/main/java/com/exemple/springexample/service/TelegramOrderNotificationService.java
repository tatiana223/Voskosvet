package com.exemple.springexample.service;

import com.exemple.springexample.dto.OrderItemResponse;
import com.exemple.springexample.dto.OrderResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramOrderNotificationService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.telegram.bot-token:}")
    private String botToken;

    @Value("${app.telegram.chat-id:}")
    private String chatId;

    @Async
    public void sendNewOrder(OrderResponse order) {
        if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            return;
        }

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("chat_id", chatId.trim());
            payload.put("text", buildMessage(order));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.telegram.org/bot" + botToken.trim() + "/sendMessage"))
                    .header("Content-Type", "application/json; charset=UTF-8")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            objectMapper.writeValueAsString(payload),
                            StandardCharsets.UTF_8
                    ))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Telegram notification failed with status {}", response.statusCode());
            }
        } catch (Exception exception) {
            log.warn("Could not send Telegram order notification: {}", exception.getMessage());
        }
    }

    private String buildMessage(OrderResponse order) {
        StringBuilder message = new StringBuilder()
                .append("🕯 Новый заказ №").append(order.id()).append('\n')
                .append("Сумма: ").append(order.totalPrice()).append(" ₽\n\n")
                .append("Покупатель: ").append(order.customer().fullName()).append('\n')
                .append("Телефон: ").append(order.customer().phone()).append('\n');

        appendIfPresent(message, "Email", order.contactEmail());
        message.append("Связаться: ").append(contactLabel(order.preferredContactMethod().name())).append('\n')
                .append("Доставка: ").append(deliveryLabel(order.deliveryMethod().name())).append('\n');
        appendIfPresent(message, "Город", order.city());
        appendIfPresent(message, "Адрес", order.deliveryAddress());
        appendIfPresent(message, "Комментарий к доставке", order.deliveryComment());

        message.append("\nСостав заказа:\n");
        for (OrderItemResponse item : order.items()) {
            message.append("• ").append(item.candleName())
                    .append(" — ").append(item.quantity()).append(" шт.")
                    .append(" × ").append(item.priceAtPurchase()).append(" ₽")
                    .append(" = ").append(item.subtotal()).append(" ₽\n");
        }

        appendIfPresent(message, "\nКомментарий", order.comment());
        String result = message.toString();
        return result.length() <= 4000 ? result : result.substring(0, 3997) + "...";
    }

    private void appendIfPresent(StringBuilder message, String label, String value) {
        if (value != null && !value.isBlank()) {
            message.append(label).append(": ").append(value.trim()).append('\n');
        }
    }

    private String deliveryLabel(String value) {
        return switch (value) {
            case "PICKUP" -> "Самовывоз";
            case "COURIER" -> "Курьер";
            case "CDEK" -> "СДЭК";
            case "POST" -> "Почта России";
            default -> value;
        };
    }

    private String contactLabel(String value) {
        return switch (value) {
            case "PHONE" -> "Телефон";
            case "WHATSAPP" -> "WhatsApp";
            case "TELEGRAM" -> "Telegram";
            case "EMAIL" -> "Email";
            default -> value;
        };
    }
}
