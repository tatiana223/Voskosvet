package com.exemple.springexample.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CandleResponse(
        Long id,
        String slug,
        LocalDateTime createdAt,
        String name,
        String description,
        String shortDescription,
        BigDecimal price,
        String scent,
        String color,
        String size,
        Integer weightGrams,
        Integer burnTimeHours,
        String imageUrl,
        Boolean available,
        Boolean featured,
        Long categoryId,
        String categoryName
) {
}
