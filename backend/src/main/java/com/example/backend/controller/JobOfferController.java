package com.example.backend.controller;

import com.example.backend.dto.JobOfferDto;
import com.example.backend.dto.JobOfferResponseDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JobOfferService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
public class JobOfferController {

    private final JobOfferService jobOfferService;
    private final UserRepository userRepository;

    public JobOfferController(JobOfferService jobOfferService, UserRepository userRepository) {
        this.jobOfferService = jobOfferService;
        this.userRepository = userRepository;
    }

    // Story 74 — Users browse active job offers
    @GetMapping
    public ResponseEntity<Page<JobOfferResponseDto>> getActiveJobOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobOfferService.getActiveJobOffers(page, size));
    }

    // Story 70 — RH views all offers (including inactive)
    @GetMapping("/all")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<Page<JobOfferResponseDto>> getAllJobOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobOfferService.getAllJobOffers(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobOfferById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobOfferService.getJobOfferById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Story 68 — RH creates a job offer
    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> createJobOffer(@RequestBody JobOfferDto dto, Authentication authentication) {
        try {
            User rh = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.status(HttpStatus.CREATED).body(jobOfferService.createJobOffer(rh, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Story 71 — RH updates a job offer
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> updateJobOffer(@PathVariable Long id, @RequestBody JobOfferDto dto) {
        try {
            return ResponseEntity.ok(jobOfferService.updateJobOffer(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Story 69 — RH deletes a job offer
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> deleteJobOffer(@PathVariable Long id) {
        try {
            jobOfferService.deleteJobOffer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
