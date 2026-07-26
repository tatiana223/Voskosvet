package com.exemple.springexample.service;

import com.exemple.springexample.dto.CandleSizeResponse;
import com.exemple.springexample.dto.CreateCandleSizeRequest;
import com.exemple.springexample.entity.CandleSize;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.repository.CandleSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandleSizeService {

    private final CandleSizeRepository candleSizeRepository;

    public List<CandleSizeResponse> getSizes() {
        return candleSizeRepository.findAllByOrderByValueCmAsc()
                .stream()
                .map(size -> new CandleSizeResponse(size.getId(), size.getValueCm()))
                .toList();
    }

    public CandleSizeResponse createSize(CreateCandleSizeRequest request) {
        if (candleSizeRepository.existsByValueCm(request.valueCm())) {
            throw new BadRequestException("Такой размер уже добавлен");
        }

        CandleSize size = new CandleSize();
        size.setValueCm(request.valueCm());
        CandleSize saved = candleSizeRepository.save(size);
        return new CandleSizeResponse(saved.getId(), saved.getValueCm());
    }
}
