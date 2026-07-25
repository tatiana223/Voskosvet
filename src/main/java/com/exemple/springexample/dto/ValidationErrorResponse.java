package com.exemple.springexample.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ValidationErrorResponse(
        String message,
        int status,
        LocalDateTime timestamp,
        Map<String, String> errors
) {
}