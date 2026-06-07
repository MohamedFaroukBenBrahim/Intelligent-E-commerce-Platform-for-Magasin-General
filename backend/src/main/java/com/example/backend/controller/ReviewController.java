package com.example.backend.controller;

import com.example.backend.dto.ReviewRequestDto;
import com.example.backend.dto.ReviewResponseDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    // US 44 — Create a review (authenticated user)
    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequestDto dto,
                                          Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            ReviewResponseDTO response = reviewService.createReview(dto, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // US 46 — Update own review
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id,
                                          @Valid @RequestBody ReviewRequestDto dto,
                                          Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            ReviewResponseDTO response = reviewService.updateReview(id, dto, user);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // US 45 — Delete own review (user) | US 47 — Delete any review (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id,
                                          Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                reviewService.deleteReviewByAdmin(id);
            } else {
                reviewService.deleteReviewByUser(id, user);
            }
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // US 43 — View own reviews
    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponseDTO>> getMyReviews(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(reviewService.getUserReviews(user.getId()));
    }

    // Public — Get reviews for a specific product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    // US 48, 49, 50 — Admin: view/search/filter all reviews
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReviewResponseDTO>> getAllReviews(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ReviewResponseDTO> reviews = reviewService.getAllReviews(
                keyword, rating, productId,
                PageRequest.of(page, size, sort));
        return ResponseEntity.ok(reviews);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
    }
}
