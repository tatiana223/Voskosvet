package com.exemple.springexample.service;

import com.exemple.springexample.dto.ReviewRequest;
import com.exemple.springexample.dto.ReviewMediaRequest;
import com.exemple.springexample.dto.ReviewMediaResponse;
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
    public ReviewResponse setMedia(Long id, List<ReviewMediaRequest> media) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Отзыв не найден"));
        review.setMediaData(serializeMedia(media));
        boolean coverStillExists = media != null && media.stream()
                .anyMatch(item -> item != null
                        && "image".equals(normalizeType(item.type()))
                        && item.url() != null
                        && item.url().equals(review.getImageUrl()));
        if (!coverStillExists) {
            review.setImageUrl(firstImage(media));
        }
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse setCover(Long id, String imageUrl) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Отзыв не найден"));
        List<ReviewMediaResponse> media = deserializeMedia(review.getMediaData());
        boolean isReviewImage = media.stream()
                .anyMatch(item -> "image".equals(item.type()) && item.url().equals(imageUrl));
        if (!isReviewImage) {
            throw new BadRequestException("Обложкой можно выбрать только фотографию этого отзыва");
        }
        review.setImageUrl(imageUrl);
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse create(ReviewRequest request, Customer author, String displayName) {
        Review review = new Review();
        review.setDisplayName(displayName);
        review.setText(request.text().trim());
        review.setRating(request.rating());
        review.setImageUrl(normalizeOptional(request.imageUrl()));
        review.setMediaData(serializeMedia(request.media()));
        if (review.getImageUrl() == null) {
            review.setImageUrl(firstImage(request.media()));
        }
        review.setFeatured(Boolean.TRUE.equals(request.featured()));
        review.setAuthor(author);
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review review) {
        List<ReviewMediaResponse> media = deserializeMedia(review.getMediaData());
        if (media.isEmpty() && review.getImageUrl() != null) {
            media = List.of(new ReviewMediaResponse(review.getImageUrl(), "image"));
        }

        return new ReviewResponse(
                review.getId(),
                review.getAuthor() == null ? null : review.getAuthor().getId(),
                review.getDisplayName(),
                review.getText(),
                review.getRating(),
                review.getImageUrl(),
                media,
                review.isFeatured(),
                review.getCreatedAt()
        );
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String serializeMedia(List<ReviewMediaRequest> media) {
        if (media == null || media.isEmpty()) return null;
        if (media.size() > 8) {
            throw new BadRequestException("К одному отзыву можно добавить не больше 8 файлов");
        }
        return media.stream()
                .filter(item -> item != null && item.url() != null && !item.url().isBlank())
                .map(item -> item.url().trim() + "|" + normalizeType(item.type()))
                .collect(java.util.stream.Collectors.joining("\n"));
    }

    private List<ReviewMediaResponse> deserializeMedia(String value) {
        if (value == null || value.isBlank()) return List.of();
        return value.lines()
                .map(line -> line.split("\\|", 2))
                .filter(parts -> parts.length == 2 && !parts[0].isBlank())
                .map(parts -> new ReviewMediaResponse(parts[0], normalizeType(parts[1])))
                .toList();
    }

    private String firstImage(List<ReviewMediaRequest> media) {
        if (media == null) return null;
        return media.stream()
                .filter(item -> item != null && "image".equals(normalizeType(item.type())))
                .map(ReviewMediaRequest::url)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String normalizeType(String type) {
        return "video".equalsIgnoreCase(type) ? "video" : "image";
    }
}
