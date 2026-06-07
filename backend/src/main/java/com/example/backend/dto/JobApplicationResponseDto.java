package com.example.backend.dto;

import com.example.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponseDto {
    private Long id;
    private Long jobOfferId;
    private String jobOfferTitle;
    private Long applicantId;
    private String applicantUsername;
    private String applicantEmail;
    private String candidateBio;
    private String candidateTitle;
    private String cvUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
