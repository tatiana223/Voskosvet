package com.exemple.springexample.service;

import com.exemple.springexample.dto.ReviewRequest;
import com.exemple.springexample.dto.ReviewResponse;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Review;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAll() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse createForCustomer(ReviewRequest request, Customer customer) {
        return create(request, customer, customer.getFullName());
    }

    @Transactional
    public ReviewResponse createForAdmin(ReviewRequest request) {
        if (request.displayName() == null || request.displayName().isBlank()) {
            throw new BadRequestException("Укажите имя автора отзыва");
        }
        return create(request, null, request.displayName().trim());
    }

    @Transactional
    public void delete(Long id, Customer customer) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Отзыв не найден"));

        boolean isAdmin = customer.getRole().name().equals("ADMIN")
                || customer.getRole().name().equals("MANAGER");
        boolean isAuthor = review.getAuthor() != null
                && review.getAuthor().getId().equals(customer.getId());

        if (!isAdmin && !isAuthor) {
            throw new BadRequestException("Нельзя удалить чужой отзыв");
        }

        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewResponse setFeatured(Long id, boolean featured) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Отзыв не найден"));
        review.setFeatured(featured);
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse setImage(Long id, String imageUrl) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Отзыв не найден"));
        review.setImageUrl(normalizeOptional(imageUrl));
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse create(ReviewRequest request, Customer author, String displayName) {
        Review review = new Review();
        review.setDisplayName(displayName);
        review.setText(request.text().trim());
        review.setRating(request.rating());
        review.setImageUrl(normalizeOptional(request.imageUrl()));
        review.setFeatured(Boolean.TRUE.equals(request.featured()));
        review.setAuthor(author);
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getAuthor() == null ? null : review.getAuthor().getId(),
                review.getDisplayName(),
                review.getText(),
                review.getRating(),
                review.getImageUrl(),
                review.isFeatured(),
                review.getCreatedAt()
        );
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
