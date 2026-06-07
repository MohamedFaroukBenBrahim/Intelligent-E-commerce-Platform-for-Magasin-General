package com.example.backend.dto;

import com.example.backend.entity.Review;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ReviewResponseDTO {

    private Long id;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long userId;
    private String username;
    private String userProfilePicture;

    private Long productId;
    private String productName;
    private String productImageUrl;


    public ReviewResponseDTO(Review review) {
        this.id = review.getId();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();

        this.userId = review.getUser().getId();
        this.username = review.getUser().getUsername();
        this.userProfilePicture = review.getUser().getProfilePictureUrl();

        this.productId = review.getProduct().getId();
        this.productName = review.getProduct().getName();
        this.productImageUrl = review.getProduct().getImageUrl();

    }
}