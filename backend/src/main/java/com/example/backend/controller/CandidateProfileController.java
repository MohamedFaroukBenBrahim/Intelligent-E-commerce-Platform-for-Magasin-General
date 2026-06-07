package com.example.backend.controller;

import com.example.backend.dto.CandidateProfileDto;
import com.example.backend.entity.CandidateProfile;
import com.example.backend.entity.User;
import com.example.backend.service.CandidateProfileService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * Handles all candidate/recruitment profile operations.
 * Kept separate from UserController so the recruitment module
 * can grow (skills, job applications, etc.) without touching auth/user logic.
 */
@RestController
@RequestMapping("/candidates")
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    public CandidateProfileController(CandidateProfileService candidateProfileService) {
        this.candidateProfileService = candidateProfileService;
    }

    /** GET /candidates/me — get (or lazily create) the current user's candidate profile */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal User user) {
        try {
            CandidateProfile profile = candidateProfileService.getOrCreate(user);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** PUT /candidates/me — update bio and/or title */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user,
                                           @RequestBody CandidateProfileDto dto) {
        try {
            CandidateProfile profile = candidateProfileService.updateProfile(user, dto);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** PATCH /candidates/me/cv — upload CV PDF to MinIO */
    @PatchMapping(value = "/me/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCv(@AuthenticationPrincipal User user,
                                      @RequestPart("cv") MultipartFile cv) {
        try {
            CandidateProfile profile = candidateProfileService.uploadCv(user, cv);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** GET /candidates/me/cv — download CV securely via Spring Boot (not direct MinIO URL) */
    @GetMapping("/me/cv")
    public ResponseEntity<?> downloadCv(@AuthenticationPrincipal User user) {
        try {
            InputStream stream = candidateProfileService.getCvStream(user);
            String filename = user.getUsername() + "_cv.pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(new InputStreamResource(stream));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
