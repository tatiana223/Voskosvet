package com.exemple.springexample.controller;

import com.exemple.springexample.dto.ReviewRequest;
import com.exemple.springexample.dto.ReviewResponse;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public List<ReviewResponse> getAll() {
        return reviewService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal Customer customer
    ) {
        return reviewService.createForCustomer(request, customer);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Customer customer) {
        reviewService.delete(id, customer);
    }
}
