package com.example.backend.repository;

import com.example.backend.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByPublishedTrue();
    List<Blog> findByAuthorId(Long authorId);
    @Query("SELECT b FROM Blog b WHERE " +
        "(:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(b.type) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
        "(:type IS NULL OR LOWER(b.type) = LOWER(:type)) AND " +
        "(:published IS NULL OR b.published = :published)")
    Page<Blog> searchAndFilter(
        @Param("keyword") String keyword,
        @Param("type") String type,
        @Param("published") Boolean published,
        Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND " +
        "(:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(b.type) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
        "(:type IS NULL OR LOWER(b.type) = LOWER(:type))")
    Page<Blog> searchPublished(
        @Param("keyword") String keyword,
        @Param("type") String type,
        Pageable pageable);
}
