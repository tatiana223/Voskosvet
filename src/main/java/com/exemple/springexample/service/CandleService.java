package com.exemple.springexample.service;

import com.exemple.springexample.dto.CandleResponse;
import com.exemple.springexample.dto.CreateCandleRequest;
import com.exemple.springexample.dto.PageResponse;
import com.exemple.springexample.dto.UpdateCandleRequest;
import com.exemple.springexample.entity.Candle;
import com.exemple.springexample.entity.CandlePriceTier;
import com.exemple.springexample.entity.Category;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.mapper.CandleMapper;
import com.exemple.springexample.repository.CandleRepository;
import com.exemple.springexample.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class CandleService {

    private final CandleRepository candleRepository;
    private final CategoryRepository categoryRepository;
    private final CandleMapper candleMapper;

    public PageResponse<CandleResponse> getCandles(
            String candleSize,
            Long categoryId,
            String scent,
            Boolean featured,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int size
    ) {
        validatePriceRange(minPrice, maxPrice);
        Pageable pageable = PageRequest.of(
                normalizePage(page),
                normalizeSize(size),
                createCandleSort(sort)
        );
        String normalizedScent = scent == null || scent.isBlank()
                ? null
                : scent.trim();
        String normalizedCandleSize = candleSize == null || candleSize.isBlank()
                ? null
                : candleSize.trim();

        Page<Candle> candlesPage = candleRepository.searchCandles(
                normalizedCandleSize,
                categoryId,
                featured,
                normalizedScent,
                minPrice,
                maxPrice,
                pageable
        );

        List<CandleResponse> items = candlesPage.getContent()
                .stream()
                .map(candleMapper::toResponse)
                .toList();

        return new PageResponse<>(
                items,
                candlesPage.getNumber(),
                candlesPage.getSize(),
                candlesPage.getTotalElements(),
                candlesPage.getTotalPages()
        );
    }

    public CandleResponse getCandleById(Long id) {
        Candle candle = candleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Свеча не найдена"));

        return candleMapper.toResponse(candle);
    }

    public CandleResponse getCandleBySlug(String slug) {
        Candle candle = candleRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Свеча не найдена"));

        return candleMapper.toResponse(candle);
    }

    public CandleResponse createCandle(CreateCandleRequest request) {
        validateSlugIsUnique(request.slug());

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));

        Candle candle = candleMapper.toEntity(request);
        candle.setFeatured(Boolean.TRUE.equals(request.featured()));
        candle.setCategory(category);
        candle.setImageUrls(normalizeImageUrls(request.imageUrls(), request.imageUrl()));
        candle.setPriceTiers(toPriceTiers(request.priceTiers(), request.price()));

        Candle savedCandle = candleRepository.save(candle);

        return candleMapper.toResponse(savedCandle);
    }

    public CandleResponse updateCandle(Long id, UpdateCandleRequest request) {
        Candle candle = candleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Свеча не найдена"));

        validateSlugIsUniqueForUpdate(request.slug(), id);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));

        candle.setSlug(request.slug());
        candle.setName(request.name());
        candle.setDescription(request.description());
        candle.setShortDescription(request.shortDescription());
        candle.setPrice(request.price());
        candle.setScent(request.scent());
        candle.setColor(request.color());
        candle.setSize(request.size());
        candle.setWeightGrams(request.weightGrams());
        candle.setBurnTimeHours(request.burnTimeHours());
        candle.setImageUrl(request.imageUrl());
        candle.getImageUrls().clear();
        candle.getImageUrls().addAll(normalizeImageUrls(request.imageUrls(), request.imageUrl()));
        candle.setAvailable(request.available());
        candle.setFeatured(request.featured());
        candle.setCategory(category);
        candle.getPriceTiers().clear();
        candle.getPriceTiers().addAll(toPriceTiers(request.priceTiers(), request.price()));

        Candle savedCandle = candleRepository.save(candle);

        return candleMapper.toResponse(savedCandle);
    }

    public void hideCandle(Long id) {
        Candle candle = candleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Свеча не найдена"));

        candle.setAvailable(false);
        candleRepository.save(candle);
    }

    private Sort createCandleSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",");

        String field = parts[0].trim();
        String directionValue = parts.length > 1 ? parts[1].trim() : "asc";

        String sortField = switch (field) {
            case "price" -> "price";
            case "name" -> "name";
            case "createdAt" -> "createdAt";
            default -> throw new BadRequestException("Недопустимое поле сортировки: " + field);
        };

        Sort.Direction direction = switch (directionValue.toLowerCase()) {
            case "asc" -> Sort.Direction.ASC;
            case "desc" -> Sort.Direction.DESC;
            default -> throw new BadRequestException("Недопустимое направление сортировки: " + directionValue);
        };

        return Sort.by(direction, sortField);
    }

    private int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private int normalizeSize(int size) {
        if (size < 1) {
            return 12;
        }

        return Math.min(size, 100);
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice == null || maxPrice == null) {
            return;
        }

        if (minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Минимальная цена не может быть больше максимальной");
        }
    }

    private void validateSlugIsUnique(String slug) {
        if (candleRepository.existsBySlug(slug)) {
            throw new BadRequestException("Свеча с таким slug уже существует");
        }
    }

    private void validateSlugIsUniqueForUpdate(String slug, Long candleId) {
        if (candleRepository.existsBySlugAndIdNot(slug, candleId)) {
            throw new BadRequestException("Свеча с таким slug уже существует");
        }
    }

    private List<CandlePriceTier> toPriceTiers(
            List<com.exemple.springexample.dto.CandlePriceTierRequest> requestedTiers,
            BigDecimal basePrice
    ) {
        if (requestedTiers == null) {
            return List.of();
        }

        HashSet<Integer> quantities = new HashSet<>();
        return requestedTiers.stream()
                .peek(tier -> {
                    if (!quantities.add(tier.quantity())) {
                        throw new BadRequestException("Количество в вариантах покупки не должно повторяться");
                    }
                    if (tier.unitPrice().compareTo(basePrice) > 0) {
                        throw new BadRequestException("Цена за штуку в наборе не может быть выше базовой цены");
                    }
                })
                .sorted(java.util.Comparator.comparingInt(
                        com.exemple.springexample.dto.CandlePriceTierRequest::quantity
                ))
                .map(tier -> new CandlePriceTier(
                        tier.quantity(),
                        tier.unitPrice(),
                        normalizeOptionalImageUrl(tier.imageUrl())
                ))
                .toList();
    }

    private List<String> normalizeImageUrls(List<String> imageUrls, String primaryImageUrl) {
        java.util.LinkedHashSet<String> normalized = new java.util.LinkedHashSet<>();
        normalized.add(primaryImageUrl.trim());
        if (imageUrls != null) {
            imageUrls.stream()
                    .filter(java.util.Objects::nonNull)
                    .map(String::trim)
                    .filter(value -> !value.isBlank())
                    .limit(11)
                    .forEach(normalized::add);
        }
        return new java.util.ArrayList<>(normalized);
    }

    private String normalizeOptionalImageUrl(String imageUrl) {
        return imageUrl == null || imageUrl.isBlank() ? null : imageUrl.trim();
    }
}
