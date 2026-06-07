package com.example.backend.repository;

import com.example.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface ProductRepository extends JpaRepository<Product, Long> {
        // JPQL
        @Query("SELECT p FROM Product p WHERE " +
                        "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(p.categorie.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
                        "(:categoryId IS NULL OR p.categorie.id = :categoryId) AND " +
                        "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                        "(:state IS NULL OR LOWER(p.state) = LOWER(:state)) AND " +
                        "(:stockStatus IS NULL OR :stockStatus = 'all' OR " +
                        "(:stockStatus = 'instock' AND p.quantity >= 1) OR " +
                        "(:stockStatus = 'outofstock' AND p.quantity < 1))")
        Page<Product> searchAndFilter(
                        @Param("keyword") String keyword,
                        @Param("categoryId") Long categoryId,
                        @Param("minPrice") Float minPrice,
                        @Param("maxPrice") Float maxPrice,
                        @Param("state") String state,
                        @Param("stockStatus") String stockStatus,
                        Pageable pageable);

        // Search and filter for discounted products only
        @Query("SELECT p FROM Product p WHERE " +
                        "p.discount > 0 AND " +
                        "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(p.categorie.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
                        "(:categoryId IS NULL OR p.categorie.id = :categoryId) AND " +
                        "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                        "(:state IS NULL OR LOWER(p.state) = LOWER(:state))")
        Page<Product> searchAndFilterDiscounted(
                        @Param("keyword") String keyword,
                        @Param("categoryId") Long categoryId,
                        @Param("minPrice") Float minPrice,
                        @Param("maxPrice") Float maxPrice,
                        @Param("state") String state,
                        Pageable pageable);

        @Query("SELECT new map(c.name as category, COUNT(p.id) as count) FROM Product p JOIN p.categorie c GROUP BY c ORDER BY c.name")
        List<Map<String, Object>> countByCategory();

        @Query("SELECT AVG(p.price) FROM Product p")
        Double getAveragePrice();

        // In ProductRepository.java
        List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        String name, String description);
}
