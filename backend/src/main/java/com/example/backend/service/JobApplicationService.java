package com.example.backend.service;

import com.example.backend.dto.JobApplicationDto;
import com.example.backend.dto.JobApplicationResponseDto;
import com.example.backend.dto.UpdateApplicationStatusDto;
import com.example.backend.entity.*;
import com.example.backend.repository.CandidateProfileRepository;
import com.example.backend.repository.JobApplicationRepository;
import com.example.backend.repository.JobOfferRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
                                  JobOfferRepository jobOfferRepository,
                                  CandidateProfileRepository candidateProfileRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.candidateProfileRepository = candidateProfileRepository;
    }

    // Story 72 — User applies to a job offer
    public JobApplicationResponseDto apply(User user, Long jobOfferId, JobApplicationDto dto) {
        JobOffer offer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));

        if (!offer.isActive()) {
            throw new RuntimeException("This job offer is no longer active");
        }

        if (jobApplicationRepository.hasApplied(jobOfferId, user.getId())) {
            throw new RuntimeException("You have already applied to this job offer");
        }

        // Check if candidate has uploaded a CV
        var candidateProfile = candidateProfileRepository.findByUserId(user.getId());
        if (candidateProfile.isEmpty() || candidateProfile.get().getCvUrl() == null || candidateProfile.get().getCvUrl().isBlank()) {
            throw new RuntimeException("You must upload a CV before applying to a job offer");
        }

        JobApplication application = new JobApplication();
        application.setJobOffer(offer);
        application.setApplicant(user);
        application.setCoverLetter(dto != null ? dto.getCoverLetter() : null);

        return toDto(jobApplicationRepository.save(application));
    }

    // Story 73 — User tracks their own applications
    public Page<JobApplicationResponseDto> getMyApplications(User user, int page, int size) {
        return jobApplicationRepository.findByApplicant(user.getId(), PageRequest.of(page, size))
                .map(app -> toDto(app));
    }

    // Story 76 — RH views applications for a specific offer
    public Page<JobApplicationResponseDto> getApplicationsForOffer(Long jobOfferId, int page, int size) {
        if (!jobOfferRepository.existsById(jobOfferId)) {
            throw new RuntimeException("Job offer not found");
        }
        return jobApplicationRepository.findByOffer(jobOfferId, PageRequest.of(page, size))
                .map(app -> toDto(app));
    }

    // Story 77 — RH accepts or rejects an application
    public JobApplicationResponseDto updateApplicationStatus(Long applicationId, UpdateApplicationStatusDto dto) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(dto.getStatus());
        return toDto(jobApplicationRepository.save(application));
    }

    // Stories 78 & 79 — RH filters and searches applications
    public Page<JobApplicationResponseDto> filterApplications(Long jobOfferId, ApplicationStatus status, String search, int page, int size) {
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;
        return jobApplicationRepository.filterApplications(jobOfferId, status, searchParam, PageRequest.of(page, size))
                .map(app -> toDto(app));
    }

    // Get applicant ID for a given application (used by HR to download CV)
    public Long getApplicantIdForApplication(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return application.getApplicant().getId();
    }

    private JobApplicationResponseDto toDto(JobApplication app) {
        JobApplicationResponseDto dto = new JobApplicationResponseDto();
        dto.setId(app.getId());
        dto.setJobOfferId(app.getJobOffer().getId());
        dto.setJobOfferTitle(app.getJobOffer().getTitle());
        dto.setApplicantId(app.getApplicant().getId());
        dto.setApplicantUsername(app.getApplicant().getUsername());
        dto.setApplicantEmail(app.getApplicant().getEmail());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setStatus(app.getStatus());
        dto.setAppliedAt(app.getAppliedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

        candidateProfileRepository.findByUserId(app.getApplicant().getId()).ifPresent(profile -> {
            dto.setCandidateBio(profile.getBio());
            dto.setCandidateTitle(profile.getTitle());
            dto.setCvUrl(profile.getCvUrl());
        });

        return dto;
    }
}
