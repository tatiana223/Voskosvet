package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record UpdateCandleRequest(
        @NotBlank(message = "Slug обязателен")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug может содержать только маленькие латинские буквы, цифры и дефисы"
        )
        String slug,

        @NotBlank(message = "Название свечи обязательно")
        String name,

        @NotBlank(message = "Описание свечи обязательно")
        String description,

        @NotBlank(message = "Короткое описание обязательно")
        String shortDescription,

        @NotNull(message = "Цена обязательна")
        @Positive(message = "Цена должна быть больше 0")
        BigDecimal price,

        @NotBlank(message = "Аромат обязателен")
        String scent,

        @NotBlank(message = "Цвет обязателен")
        String color,

        @NotBlank(message = "Размер свечи обязателен")
        String size,

        @NotNull(message = "Вес обязателен")
        @Positive(message = "Вес должен быть больше 0")
        Integer weightGrams,

        @NotNull(message = "Время горения обязательно")
        @Positive(message = "Время горения должно быть больше 0")
        Integer burnTimeHours,

        @NotBlank(message = "Ссылка на изображение обязательна")
        String imageUrl,

        @NotNull(message = "Доступность обязательна")
        Boolean available,

        @NotNull(message = "Признак избранной свечи обязателен")
        Boolean featured,

        @NotNull(message = "Категория обязательна")
        Long categoryId,

        List<@jakarta.validation.Valid CandlePriceTierRequest> priceTiers
) {
}
