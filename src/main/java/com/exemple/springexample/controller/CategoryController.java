package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CategoryResponse;
import com.exemple.springexample.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Категории свечей")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Получить список активных категорий")
    @GetMapping
    public List<CategoryResponse> getActiveCategories() {
        return categoryService.getActiveCategories();
    }

    @Operation(summary = "Получить категорию по названию")
    @GetMapping("/name/{name}")
    public CategoryResponse getCategoryByName(@PathVariable String name) {
        return categoryService.getCategoryByName(name);
    }
}
