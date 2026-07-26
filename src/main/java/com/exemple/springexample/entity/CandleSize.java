package com.exemple.springexample.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "candle_sizes")
public class CandleSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "value_cm", nullable = false, unique = true)
    private Integer valueCm;
}
