package com.example.backend.repository;

import com.example.backend.entity.JobOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    @Query(value = "SELECT o FROM JobOffer o WHERE o.active = true ORDER BY o.postedAt DESC",
           countQuery = "SELECT COUNT(o) FROM JobOffer o WHERE o.active = true")
    Page<JobOffer> findActiveOffers(Pageable pageable);

    @Query(value = "SELECT o FROM JobOffer o ORDER BY o.postedAt DESC",
           countQuery = "SELECT COUNT(o) FROM JobOffer o")
    Page<JobOffer> findAllOffers(Pageable pageable);

    @Query(value = "SELECT o FROM JobOffer o WHERE LOWER(o.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY o.postedAt DESC",
           countQuery = "SELECT COUNT(o) FROM JobOffer o WHERE LOWER(o.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<JobOffer> searchOffers(@Param("keyword") String keyword, Pageable pageable);
}
