package com.example.backend.service;

import com.example.backend.dto.CandidateProfileDto;
import com.example.backend.entity.CandidateProfile;
import com.example.backend.entity.User;
import com.example.backend.repository.CandidateProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@Slf4j
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final MinioStorageService storageService;
    private final Tika tika = new Tika();  // Apache Tika for extracting text from files

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.bucket}")
    private String bucket;

    public CandidateProfileService(CandidateProfileRepository candidateProfileRepository,
                                   MinioStorageService storageService) {
        this.candidateProfileRepository = candidateProfileRepository;
        this.storageService = storageService;
    }

    /**
     * Get the candidate profile for the given user.
     * Creates an empty one if it doesn't exist yet (lazy creation).
     */
    public CandidateProfile getOrCreate(User user) {
        return candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CandidateProfile profile = new CandidateProfile();
                    profile.setUser(user);
                    return candidateProfileRepository.save(profile);
                });
    }

    /**
     * Update bio and/or title.
     */
    public CandidateProfile updateProfile(User user, CandidateProfileDto dto) {
        CandidateProfile profile = getOrCreate(user);
        if (dto.getBio()   != null) profile.setBio(dto.getBio());
        if (dto.getTitle() != null) profile.setTitle(dto.getTitle());
        return candidateProfileRepository.save(profile);
    }

    /**
     * Upload a CV (PDF only) to MinIO under users/cvs/ and store the URL.
     * ALSO automatically extracts text from the PDF and stores it in extractedCvText.
     */
    public CandidateProfile uploadCv(User user, MultipartFile cv) {
        if (!"application/pdf".equalsIgnoreCase(cv.getContentType())) {
            throw new RuntimeException("Only PDF files are accepted for CV");
        }
        CandidateProfile profile = getOrCreate(user);
        
        // Delete previous CV if it exists
        if (profile.getCvUrl() != null) {
            storageService.deleteFile(profile.getCvUrl());
        }
        
        // Upload CV to MinIO
        String url = storageService.uploadFile(cv, "users/cvs");
        profile.setCvUrl(url);
        
        // Extract text from CV and store it
        try {
            String extractedText = extractTextFromCv(cv);
            profile.setExtractedCvText(extractedText);
            log.info("Successfully extracted {} characters from CV for user: {}", extractedText.length(), user.getId());
        } catch (Exception e) {
            log.error("Error extracting text from CV for user: {}", user.getId(), e);
            // Don't fail the upload if extraction fails, just log the error
            profile.setExtractedCvText(""); // Set empty if extraction fails
        }
        
        return candidateProfileRepository.save(profile);
    }

    /**
     * Extract text from a CV file using Apache Tika.
     * 
     * How it works:
     * 1. Takes the PDF file from the upload
     * 2. Apache Tika reads the PDF content
     * 3. Extracts all text from the PDF
     * 4. Returns the extracted text as a String
     * 
     * This text is then stored in the database for later use by AI recommendations.
     * 
     * @param cvFile The PDF file uploaded by candidate
     * @return Extracted text from the PDF
     * @throws Exception if extraction fails
     */
    private String extractTextFromCv(MultipartFile cvFile) throws Exception {
        try (InputStream inputStream = cvFile.getInputStream()) {
            // Tika.parseToString() extracts all text from the file
            String extractedText = tika.parseToString(inputStream);
            
            // Clean up: remove excessive whitespace
            extractedText = extractedText
                    .replaceAll("\\s+", " ")  // Replace multiple spaces with single space
                    .trim();
            
            // Limit to reasonable size (e.g., 50,000 characters)
            if (extractedText.length() > 50000) {
                extractedText = extractedText.substring(0, 50000);
            }
            
            return extractedText;
        }
    }

    /**
     * Stream the CV back through Spring Boot (avoids exposing the raw MinIO URL).
     */
    public InputStream getCvStream(User user) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No candidate profile found"));
        if (profile.getCvUrl() == null) {
            throw new RuntimeException("No CV uploaded yet");
        }
        // Extract the MinIO object name from the stored public URL
        String objectName = profile.getCvUrl()
                .replace(minioUrl + "/" + bucket + "/", "");
        return storageService.getFile(objectName);
    }

    /**
     * Stream a candidate's CV by their user ID (for HR to download).
     */
    public InputStream getCvStreamByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));
        if (profile.getCvUrl() == null || profile.getCvUrl().isBlank()) {
            throw new IllegalArgumentException("Candidate has not uploaded a CV yet");
        }
        // Extract the MinIO object name from the stored public URL
        String objectName = profile.getCvUrl()
                .replace(minioUrl + "/" + bucket + "/", "");
        return storageService.getFile(objectName);
    }
}
