package com.exemple.springexample.mapper;

import com.exemple.springexample.dto.CategoryResponse;
import com.exemple.springexample.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);
}
