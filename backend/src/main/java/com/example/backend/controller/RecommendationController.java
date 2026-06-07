package com.example.backend.controller;

import com.example.backend.dto.RecommendationResponseDTO;
import com.example.backend.service.JobRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/recommandations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {
    private final JobRecommendationService jobRecommendationService;
    @GetMapping("/{candidateId}")
    @PreAuthorize("isAuthenticated()")  // Only logged-in users can access
    public ResponseEntity<?> getRecommendations(@PathVariable Long candidateId) {
        log.info("Received recommendation request for candidate: {}", candidateId);

        try {
            // Validate input
            if (candidateId == null || candidateId <= 0) {
                log.warn("Invalid candidateId: {}", candidateId);
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Invalid candidate ID. Must be a positive number."));
            }

            // Call service to get recommendations
            List<RecommendationResponseDTO> recommendations = jobRecommendationService.getRecommendations(candidateId);

            log.info("Successfully generated {} recommendations for candidate: {}", recommendations.size(), candidateId);

            // Return 200 OK with recommendations
            return ResponseEntity.ok(recommendations);

        } catch (IllegalArgumentException e) {
            // Candidate profile not found
            log.warn("Candidate not found: {}", candidateId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Candidate profile not found with ID: " + candidateId));

        } catch (Exception e) {
            // Unexpected error (database error, AI service error, etc.)
            log.error("Error generating recommendations for candidate {}: {}", candidateId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error generating recommendations. Please try again later."));
        }
    }

    /**
     * Simple error response object for API errors.
     * Returns a JSON with error message when something goes wrong.
     */
    @lombok.Getter
    @lombok.Setter
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class ErrorResponse {
        private String message;
    }
}
