package com.exemple.springexample.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateCategoryRequest(
        @NotBlank(message = "Название категории обязательно")
        String name,

        String description,

        @NotNull(message = "Активность категории обязательна")
        Boolean active
) {
}