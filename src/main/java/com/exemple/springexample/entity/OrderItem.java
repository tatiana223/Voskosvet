package com.exemple.springexample.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "candle_id", nullable = false)
    private Candle candle;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer packageSize = 1;

    @Column(nullable = false)
    private Integer boxQuantity = 1;

    @Column(nullable = false)
    private BigDecimal priceAtPurchase;
}
