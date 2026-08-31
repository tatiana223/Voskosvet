package com.exemple.springexample.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "candles")
public class Candle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(length = 300)
    private String shortDescription;

    @Column(length = 160)
    private String seoTitle;

    @Column(length = 320)
    private String seoDescription;

    @Column(length = 160)
    private String material;

    @Column(length = 160)
    private String wickType;

    @Column(length = 1000)
    private String usageInstructions;

    @Column(nullable = false)
    private BigDecimal price;

    private String scent;

    private String color;

    private String size;

    private Integer weightGrams;

    private Integer burnTimeHours;

    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "candle_images",
            joinColumns = @JoinColumn(name = "candle_id")
    )
    @Column(name = "image_url", nullable = false)
    @OrderColumn(name = "sort_order")
    @Fetch(FetchMode.SUBSELECT)
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candle_image_alts", joinColumns = @JoinColumn(name = "candle_id"))
    @MapKeyColumn(name = "image_url", length = 500)
    @Column(name = "alt_text", nullable = false, length = 300)
    @Fetch(FetchMode.SUBSELECT)
    private Map<String, String> imageAlts = new LinkedHashMap<>();

    private Boolean available = true;

    @Column(nullable = false)
    private Boolean featured = false;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "candle_price_tiers",
            joinColumns = @JoinColumn(name = "candle_id")
    )
    @OrderBy("quantity ASC")
    @Fetch(FetchMode.SUBSELECT)
    private List<CandlePriceTier> priceTiers = new ArrayList<>();
}
