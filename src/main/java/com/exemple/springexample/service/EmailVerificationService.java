package com.exemple.springexample.service;

import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.EmailVerificationToken;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.repository.CustomerRepository;
import com.exemple.springexample.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final EmailVerificationTokenRepository tokenRepository;
    private final CustomerRepository customerRepository;
    private final JavaMailSender mailSender;

    @Value("${app.public-url}")
    private String publicUrl;

    @Value("${app.mail.from}")
    private String from;

    @Transactional
    public void sendVerificationEmail(Customer customer) {
        tokenRepository.deleteByCustomerId(customer.getId());
        tokenRepository.flush();

        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setCustomer(customer);
        token.setTokenHash(hash(rawToken));
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        tokenRepository.save(token);

        String verificationUrl = publicUrl + "/verify-email?token=" + rawToken;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(customer.getEmail());
        message.setSubject("Подтвердите email — ВоскоСвет");
        message.setText("""
                Здравствуйте, %s!

                Подтвердите email, чтобы завершить регистрацию в магазине ВоскоСвет:
                %s

                Ссылка действует 24 часа. Если вы не регистрировались, просто проигнорируйте письмо.
                """.formatted(customer.getFullName(), verificationUrl));
        mailSender.send(message);
    }

    @Transactional
    public void verify(String rawToken) {
        EmailVerificationToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("Ссылка подтверждения недействительна"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(token);
            throw new BadRequestException("Срок действия ссылки истёк. Запросите новое письмо");
        }

        Customer customer = token.getCustomer();
        customer.setEmailVerified(true);
        customerRepository.save(customer);
        tokenRepository.delete(token);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
