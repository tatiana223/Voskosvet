package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CandleSizeResponse;
import com.exemple.springexample.service.CandleSizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/candle-sizes")
@RequiredArgsConstructor
public class CandleSizeController {

    private final CandleSizeService candleSizeService;

    @GetMapping
    public List<CandleSizeResponse> getSizes() {
        return candleSizeService.getSizes();
    }
}
