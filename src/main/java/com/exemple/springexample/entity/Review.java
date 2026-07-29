package com.exemple.springexample.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String displayName;

    @Column(name = "review_text", nullable = false, length = 1000)
    private String text;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String mediaData;

    @Column(nullable = false)
    private boolean featured;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Customer author;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
