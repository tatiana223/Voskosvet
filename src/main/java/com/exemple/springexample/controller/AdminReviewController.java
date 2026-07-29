package com.exemple.springexample.controller;

import com.exemple.springexample.dto.ReviewRequest;
import com.exemple.springexample.dto.ReviewResponse;
import com.exemple.springexample.dto.ReviewMediaRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@Valid @RequestBody ReviewRequest request) {
        return reviewService.createForAdmin(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Customer customer) {
        reviewService.delete(id, customer);
    }

    @PatchMapping("/{id}/featured")
    public ReviewResponse setFeatured(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body
    ) {
        return reviewService.setFeatured(id, Boolean.TRUE.equals(body.get("featured")));
    }

    @PatchMapping("/{id}/media")
    public ReviewResponse setMedia(
            @PathVariable Long id,
            @RequestBody List<ReviewMediaRequest> media
    ) {
        return reviewService.setMedia(id, media);
    }

    @PatchMapping("/{id}/cover")
    public ReviewResponse setCover(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return reviewService.setCover(id, body.get("imageUrl"));
    }
}
