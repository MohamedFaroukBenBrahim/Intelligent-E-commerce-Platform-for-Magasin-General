package com.example.backend.repository;

import com.example.backend.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    @Query("SELECT c FROM ContactMessage c WHERE " +
            "(:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.message) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:read IS NULL OR c.read = :read)")
    Page<ContactMessage> searchAndFilter(
            @Param("keyword") String keyword,
            @Param("read") Boolean read,
            Pageable pageable);
}
