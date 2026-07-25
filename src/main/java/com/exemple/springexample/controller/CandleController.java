package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CandleResponse;
import com.exemple.springexample.dto.CreateCandleRequest;
import com.exemple.springexample.dto.PageResponse;
import com.exemple.springexample.dto.UpdateCandleRequest;
import com.exemple.springexample.service.CandleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/candles")
@RequiredArgsConstructor
@Tag(name = "Candles", description = "Каталог свечей")
public class CandleController {

    private final CandleService candleService;

    @Operation(summary = "Получить страницу свечей")
    @GetMapping
    public PageResponse<CandleResponse> getCandles(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String scent,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return candleService.getCandles(categoryId, scent, featured, minPrice,
                maxPrice, sort, page, size);
    }

    @Operation(summary = "Получить свечу по id")
    @GetMapping("/{id}")
    public CandleResponse getCandleById(@PathVariable Long id) {
        return candleService.getCandleById(id);
    }

    @Operation(summary = "Получить свечу по slug")
    @GetMapping("/slug/{slug}")
    public CandleResponse getCandleBySlug(@PathVariable String slug) {
        return candleService.getCandleBySlug(slug);
    }

}
