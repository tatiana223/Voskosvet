package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank(message = "Название категории обязательно")
        String name,

        String description,

        Boolean active
) {
}