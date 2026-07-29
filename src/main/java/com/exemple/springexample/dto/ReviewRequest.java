package com.exemple.springexample.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        String displayName,

        @NotBlank(message = "Текст отзыва обязателен")
        @Size(min = 10, max = 1000, message = "Отзыв должен содержать от 10 до 1000 символов")
        String text,

        @Min(value = 1, message = "Минимальная оценка — 1")
        @Max(value = 5, message = "Максимальная оценка — 5")
        int rating,

        String imageUrl,

        Boolean featured
) {
}
