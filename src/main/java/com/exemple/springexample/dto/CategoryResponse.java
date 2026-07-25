package com.exemple.springexample.dto;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        Boolean active
) {
}