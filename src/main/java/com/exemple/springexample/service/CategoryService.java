package com.exemple.springexample.service;

import com.exemple.springexample.dto.CategoryResponse;
import com.exemple.springexample.dto.CreateCategoryRequest;
import com.exemple.springexample.dto.UpdateCategoryRequest;
import com.exemple.springexample.entity.Category;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.mapper.CategoryMapper;
import com.exemple.springexample.repository.CandleRepository;
import com.exemple.springexample.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final CandleRepository candleRepository;

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public CategoryResponse getCategoryByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Категория не найдена"));

        return categoryMapper.toResponse(category);
    }

    public CategoryResponse createCategory(CreateCategoryRequest request) {
        validateCategoryNameIsUnique(request.name());

        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        category.setActive(request.active() == null || request.active());

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));

        validateCategoryNameIsUniqueForUpdate(request.name(), id);

        category.setName(request.name());
        category.setDescription(request.description());
        category.setActive(request.active());

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);
    }

    private void validateCategoryNameIsUnique(String name) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Категория с таким названием уже существует");
        }
    }

    private void validateCategoryNameIsUniqueForUpdate(String name, Long categoryId) {
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, categoryId)) {
            throw new BadRequestException("Категория с таким названием уже существует");
        }
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Категория не найдена"));

        if (candleRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Нельзя удалить категорию, в которой есть свечи");
        }

        categoryRepository.delete(category);
    }

}
