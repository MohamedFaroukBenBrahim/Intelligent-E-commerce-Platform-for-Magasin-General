package com.example.backend.repository;

import com.example.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByUserId(Long userId);

    List<Review> findByProductId(Long productId);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r WHERE " +
           "(:keyword IS NULL OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.product.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:rating IS NULL OR r.rating = :rating) AND " +
           "(:productId IS NULL OR r.product.id = :productId)")
    Page<Review> searchAndFilter(
            @Param("keyword") String keyword,
            @Param("rating") Integer rating,
            @Param("productId") Long productId,
            Pageable pageable);
}
