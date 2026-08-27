package com.exemple.springexample.service;

import com.exemple.springexample.dto.OrderItemResponse;
import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.dto.ReviewResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.notifications.email:}")
    private String recipient;

    @Value("${app.public-url:http://localhost}")
    private String publicUrl;

    @Async
    public void sendNewOrder(OrderResponse order) {
        StringBuilder text = new StringBuilder()
                .append("Новый заказ №").append(order.id()).append('\n')
                .append("Сумма: ").append(order.totalPrice()).append(" ₽\n\n")
                .append("Покупатель: ").append(order.customer().fullName()).append('\n')
                .append("Телефон: ").append(order.customer().phone()).append('\n');
        appendIfPresent(text, "Email", order.contactEmail());
        appendIfPresent(text, "Город", order.city());
        appendIfPresent(text, "Адрес", order.deliveryAddress());
        appendIfPresent(text, "Комментарий к доставке", order.deliveryComment());
        text.append("\nСостав заказа:\n");
        for (OrderItemResponse item : order.items()) {
            text.append("• ").append(item.candleName())
                    .append(" — ").append(item.quantity()).append(" шт. × ")
                    .append(item.priceAtPurchase()).append(" ₽ = ")
                    .append(item.subtotal()).append(" ₽\n");
        }
        appendIfPresent(text, "\nКомментарий", order.comment());
        text.append("\nОткрыть заказ: ").append(siteUrl()).append("/admin/orders");
        send("Новый заказ №" + order.id() + " — ВоскоСвет", text.toString());
    }

    @Async
    public void sendNewReview(ReviewResponse review) {
        String text = "Новый отзыв на сайте\n\n"
                + "Автор: " + review.name() + "\n"
                + "Оценка: " + review.rating() + "/5\n\n"
                + review.text() + "\n\n"
                + "Открыть отзывы: " + siteUrl() + "/admin/reviews";
        send("Новый отзыв — ВоскоСвет", text);
    }

    private void send(String subject, String text) {
        if (recipient == null || recipient.isBlank()) {
            log.warn("Notification email is not configured");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(recipient.trim());
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Could not send email notification: {}", exception.getMessage());
        }
    }

    private void appendIfPresent(StringBuilder text, String label, String value) {
        if (value != null && !value.isBlank()) {
            text.append(label).append(": ").append(value.trim()).append('\n');
        }
    }

    private String siteUrl() {
        return publicUrl == null ? "" : publicUrl.replaceAll("/+$", "");
    }
}
