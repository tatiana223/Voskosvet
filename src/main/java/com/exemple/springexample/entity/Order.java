package com.exemple.springexample.entity;

import com.exemple.springexample.model.DeliveryMethod;
import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.OrderStatus;
import com.exemple.springexample.model.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.NEW;

    @Column(nullable = false)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal itemsPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal deliveryPrice = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryMethod deliveryMethod;

    private String city;

    private String deliveryAddress;

    private String deliveryComment;

    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactMethod preferredContactMethod = ContactMethod.PHONE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    private String comment;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
