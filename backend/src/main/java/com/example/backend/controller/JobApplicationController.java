package com.example.backend.controller;

import com.example.backend.dto.JobApplicationDto;
import com.example.backend.dto.JobApplicationResponseDto;
import com.example.backend.dto.UpdateApplicationStatusDto;
import com.example.backend.entity.ApplicationStatus;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JobApplicationService;
import com.example.backend.service.CandidateProfileService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;

@RestController
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserRepository userRepository;
    private final CandidateProfileService candidateProfileService;

    public JobApplicationController(JobApplicationService jobApplicationService, 
                                   UserRepository userRepository,
                                   CandidateProfileService candidateProfileService) {
        this.jobApplicationService = jobApplicationService;
        this.userRepository = userRepository;
        this.candidateProfileService = candidateProfileService;
    }

    // Story 72 — User applies to a job offer
    @PostMapping("/jobs/{jobOfferId}/apply")
    public ResponseEntity<?> apply(
            @PathVariable Long jobOfferId,
            @RequestBody(required = false) JobApplicationDto dto,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(jobApplicationService.apply(user, jobOfferId, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Story 73 — User tracks their own applications
    @GetMapping("/applications/me")
    public ResponseEntity<Page<JobApplicationResponseDto>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(jobApplicationService.getMyApplications(user, page, size));
    }

    // Story 76 — RH views applications for a specific offer
    @GetMapping("/jobs/{jobOfferId}/applications")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> getApplicationsForOffer(
            @PathVariable Long jobOfferId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            return ResponseEntity.ok(jobApplicationService.getApplicationsForOffer(jobOfferId, page, size));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Stories 78 & 79 — RH filters and searches all applications
    @GetMapping("/applications")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<Page<JobApplicationResponseDto>> filterApplications(
            @RequestParam(required = false) Long jobOfferId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobApplicationService.filterApplications(jobOfferId, status, search, page, size));
    }

    // Story 77 — RH accepts or rejects an application
    @PatchMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody UpdateApplicationStatusDto dto) {
        try {
            return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // RH downloads candidate CV from application
    @GetMapping("/applications/{applicationId}/cv")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> downloadApplicationCv(@PathVariable Long applicationId) {
        try {
            Long applicantId = jobApplicationService.getApplicantIdForApplication(applicationId);
            InputStream stream = candidateProfileService.getCvStreamByUserId(applicantId);
            String filename = "application_" + applicationId + "_cv.pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(new InputStreamResource(stream));
        } catch (IllegalArgumentException e) {
            // Candidate hasn't uploaded CV
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            // Application or profile not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
