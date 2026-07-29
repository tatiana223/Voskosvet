package com.exemple.springexample.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewResponse(
        Long id,
        Long authorId,
        String name,
        String text,
        int rating,
        String photoUrl,
        List<ReviewMediaResponse> media,
        boolean featured,
        LocalDateTime createdAt
) {
}
