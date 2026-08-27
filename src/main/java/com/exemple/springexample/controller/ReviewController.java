package com.exemple.springexample.controller;

import com.exemple.springexample.dto.ReviewRequest;
import com.exemple.springexample.dto.ReviewResponse;
import com.exemple.springexample.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            @Valid @RequestBody ReviewRequest request
    ) {
        return reviewService.createForGuest(request);
    }
}
