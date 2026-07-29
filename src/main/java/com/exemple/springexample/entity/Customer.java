package com.exemple.springexample.entity;
import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.DeliveryMethod;
import com.exemple.springexample.model.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String normalizedPhone;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private boolean emailVerified = false;

    private String city;

    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactMethod preferredContactMethod = ContactMethod.WHATSAPP;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryMethod defaultDeliveryMethod = DeliveryMethod.CDEK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod defaultPaymentMethod = PaymentMethod.TRANSFER;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false)
    private boolean primaryAdmin = false;

    @Column(nullable = false)
    private boolean blocked = false;

    @Column(length = 500)
    private String blockedReason;

    private LocalDateTime blockedAt;

    @PrePersist
    @PreUpdate
    private void updateNormalizedPhone() {
        normalizedPhone = normalizePhone(phone);
    }

    public static String normalizePhone(String phone) {
        if (phone == null) {
            return "";
        }

        String digits = phone.replaceAll("\\D", "");

        if (digits.length() == 10) {
            return "7" + digits;
        }

        if (digits.length() == 11 && digits.startsWith("8")) {
            return "7" + digits.substring(1);
        }

        return digits;
    }
}
