package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CandleResponse;
import com.exemple.springexample.dto.CreateCandleRequest;
import com.exemple.springexample.dto.UpdateCandleRequest;
import com.exemple.springexample.service.CandleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/candles")
@RequiredArgsConstructor
@Tag(name = "Admin Candles", description = "Управление свечами")
@SecurityRequirement(name = "basicAuth")
public class AdminCandleController {

    private final CandleService candleService;

    @Operation(summary = "Создать свечу")
    @PostMapping
    public CandleResponse createCandle(@Valid @RequestBody CreateCandleRequest request) {
        return candleService.createCandle(request);
    }

    @Operation(summary = "Обновить свечу")
    @PutMapping("/{id}")
    public CandleResponse updateCandle(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCandleRequest request
    ) {
        return candleService.updateCandle(id, request);
    }

    @Operation(summary = "Скрыть свечу из каталога")
    @DeleteMapping("/{id}")
    public void hideCandle(@PathVariable Long id) {
        candleService.hideCandle(id);
    }
}