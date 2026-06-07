package com.example.backend.service;

import com.example.backend.dto.ReviewRequestDto;
import com.example.backend.dto.ReviewResponseDTO;
import com.example.backend.entity.Product;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    // US 44 — user creates a review
    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDto dto, User user) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + dto.getProductId()));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new IllegalStateException("You have already reviewed this product.");
        }

        Review review = new Review();
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setUser(user);
        review.setProduct(product);

        Review saved = reviewRepository.save(review);
        recalculateProductRate(product);
        return new ReviewResponseDTO(saved);
    }

    // US 46 — user updates own review
    @Transactional
    public ReviewResponseDTO updateReview(Long reviewId, ReviewRequestDto dto, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You are not allowed to modify this review.");
        }

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review saved = reviewRepository.save(review);
        recalculateProductRate(review.getProduct());
        return new ReviewResponseDTO(saved);
    }

    // US 45 — user deletes own review
    @Transactional
    public void deleteReviewByUser(Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You are not allowed to delete this review.");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductRate(product);
    }

    // US 47 — admin deletes any review
    @Transactional
    public void deleteReviewByAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductRate(product);
    }

    // US 43 — user views own reviews
    public List<ReviewResponseDTO> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId)
                .stream()
                .map(review -> new ReviewResponseDTO(review))
                .collect(Collectors.toList());
    }

    // Public — get all reviews for a product
    public List<ReviewResponseDTO> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(review -> new ReviewResponseDTO(review))
                .collect(Collectors.toList());
    }

    // US 48, 49, 50 — admin views/searches/filters reviews
    public Page<ReviewResponseDTO> getAllReviews(String keyword, Integer rating, Long productId, Pageable pageable) {
        return reviewRepository.searchAndFilter(keyword, rating, productId, pageable)
                .map(review -> new ReviewResponseDTO(review));
    }

    // Recalculates and persists the average rating on the product
    private void recalculateProductRate(Product product) {
        Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
        product.setRate(avg != null ? avg.floatValue() : null);
        productRepository.save(product);
    }
}
