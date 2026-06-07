package com.example.backend.repository;

import com.example.backend.entity.ApplicationStatus;
import com.example.backend.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    @Query(value = "SELECT a FROM JobApplication a WHERE a.applicant.id = :userId ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM JobApplication a WHERE a.applicant.id = :userId")
    Page<JobApplication> findByApplicant(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT a FROM JobApplication a WHERE a.jobOffer.id = :offerId ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM JobApplication a WHERE a.jobOffer.id = :offerId")
    Page<JobApplication> findByOffer(@Param("offerId") Long offerId, Pageable pageable);

    Optional<JobApplication> findByJobOfferIdAndApplicantId(Long jobOfferId, Long applicantId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM JobApplication a WHERE a.jobOffer.id = :offerId AND a.applicant.id = :userId")
    boolean hasApplied(@Param("offerId") Long offerId, @Param("userId") Long userId);

    @Query(value = "SELECT a FROM JobApplication a WHERE " +
           "(:jobOfferId IS NULL OR a.jobOffer.id = :jobOfferId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR LOWER(a.applicant.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.applicant.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM JobApplication a WHERE " +
           "(:jobOfferId IS NULL OR a.jobOffer.id = :jobOfferId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR LOWER(a.applicant.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.applicant.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<JobApplication> filterApplications(
            @Param("jobOfferId") Long jobOfferId,
            @Param("status") ApplicationStatus status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT new map(a.status as status, COUNT(a) as count) FROM JobApplication a GROUP BY a.status")
    List<Map<String, Object>> countByStatus();

}
