package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Recruitment-specific profile for a user.
 * Created lazily — only exists when the user interacts with the recruitment module.
 * Keeps User lean and lets the recruitment module grow independently.
 */
@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // ── Recruitment fields ──────────────────────────────────────────────────

    @Column(length = 500)
    private String bio;

    @Column(length = 100)
    private String title;           // e.g. "Full-Stack Developer"

    @Column(name = "cv_url")
    private String cvUrl;

    @Column(columnDefinition = "LONGTEXT", name = "extracted_cv_text")
    private String extractedCvText; // Automatically extracted text from the CV file

    // Future fields (just uncomment when needed):
    // private String linkedinUrl;
    // private String portfolioUrl;
    // @ElementCollection private List<String> skills;

    // ── Audit ───────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
