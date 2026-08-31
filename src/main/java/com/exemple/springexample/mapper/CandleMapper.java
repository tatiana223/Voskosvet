package com.exemple.springexample.mapper;

import com.exemple.springexample.dto.CandleResponse;
import com.exemple.springexample.dto.CreateCandleRequest;
import com.exemple.springexample.entity.Candle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CandleMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    CandleResponse toResponse(Candle candle);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "priceTiers", ignore = true)
    @Mapping(target = "imageUrls", ignore = true)
    @Mapping(target = "imageAlts", ignore = true)
    Candle toEntity(CreateCandleRequest request);
}
