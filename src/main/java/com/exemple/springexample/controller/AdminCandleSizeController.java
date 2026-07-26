package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CandleSizeResponse;
import com.exemple.springexample.dto.CreateCandleSizeRequest;
import com.exemple.springexample.service.CandleSizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/candle-sizes")
@RequiredArgsConstructor
public class AdminCandleSizeController {

    private final CandleSizeService candleSizeService;

    @PostMapping
    public CandleSizeResponse createSize(@Valid @RequestBody CreateCandleSizeRequest request) {
        return candleSizeService.createSize(request);
    }
}
