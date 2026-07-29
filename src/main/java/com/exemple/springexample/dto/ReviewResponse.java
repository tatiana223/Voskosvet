package com.exemple.springexample.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long authorId,
        String name,
        String text,
        int rating,
        String photoUrl,
        boolean featured,
        LocalDateTime createdAt
) {
}
