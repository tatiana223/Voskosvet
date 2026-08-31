package com.exemple.springexample.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record CandleResponse(
        Long id,
        String slug,
        LocalDateTime createdAt,
        String name,
        String description,
        String shortDescription,
        String seoTitle,
        String seoDescription,
        String material,
        String wickType,
        String usageInstructions,
        BigDecimal price,
        String scent,
        String color,
        String size,
        Integer weightGrams,
        Integer burnTimeHours,
        String imageUrl,
        List<String> imageUrls,
        Map<String, String> imageAlts,
        Boolean available,
        Boolean featured,
        Long categoryId,
        String categoryName,
        List<CandlePriceTierResponse> priceTiers
) {
}
