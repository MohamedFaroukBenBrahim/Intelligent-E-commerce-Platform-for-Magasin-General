package com.example.backend.service;

import com.example.backend.dto.RecommendationResponseDTO;
import com.example.backend.entity.CandidateProfile;
import com.example.backend.entity.JobOffer;
import com.example.backend.repository.CandidateProfileRepository;
import com.example.backend.repository.JobOfferRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating intelligent job recommendations based on candidate profile.
 *
 * How it works:
 * 1. Fetches candidate profile (bio, title, extracted CV text)
 * 2. Fetches all active job offers
 * 3. Sends both to Google Gemini via Spring AI
 * 4. Gemini analyzes semantic match between candidate skills and job requirements
 * 5. Returns top 10 recommendations sorted by relevance score (0-100)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobRecommendationService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    /**
     * Get intelligent job recommendations for a candidate.
     *
     * @param candidateId The ID of the candidate
     * @return List of top 10 job recommendations with relevance scores and reasons
     * @throws IllegalArgumentException if candidate not found
     */
    public List<RecommendationResponseDTO> getRecommendations(Long candidateId) {
        log.info("Generating recommendations for candidate: {}", candidateId);

        // Step 1: Fetch candidate profile with their data
        CandidateProfile candidateProfile = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found with ID: " + candidateId));

        // Validate that candidate has a CV uploaded (profile data to analyze)
        if (candidateProfile.getExtractedCvText() == null || candidateProfile.getExtractedCvText().isBlank()) {
            log.warn("Candidate {} has no extracted CV text", candidateId);
            return new ArrayList<>(); // Return empty list if no CV data
        }

        // Step 2: Fetch all active job offers
        List<JobOffer> activeJobOffers = jobOfferRepository.findActiveOffers(
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
        ).getContent();

        if (activeJobOffers.isEmpty()) {
            log.warn("No active job offers found");
            return new ArrayList<>();
        }

        log.info("Found {} active job offers for matching", activeJobOffers.size());

        // Step 3: Build the prompt for Gemini AI
        String analysisPrompt = buildAnalysisPrompt(candidateProfile, activeJobOffers);

        // Step 4: Send to Google Gemini via Spring AI and get response
        String aiResponse = chatClient.prompt()
                .user(analysisPrompt)
                .call()
                .content();

        log.debug("AI Response received for candidate recommendations");

        // Step 5: Parse AI response and convert to recommendation DTOs
        List<RecommendationResponseDTO> recommendations = parseAiResponse(aiResponse, activeJobOffers);

        // Step 6: Sort by relevance score (highest first) and return top 10
        return recommendations.stream()
                .sorted((a, b) -> b.getRelevanceScore().compareTo(a.getRelevanceScore()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Build the prompt to send to Google Gemini.
     * This prompt instructs Gemini to analyze the candidate and score each job.
     */
    private String buildAnalysisPrompt(CandidateProfile candidateProfile, List<JobOffer> jobOffers) {
        StringBuilder prompt = new StringBuilder();

        // Part 1: Describe the candidate
        prompt.append("CANDIDATE PROFILE:\n");
        prompt.append("Title: ").append(candidateProfile.getTitle()).append("\n");
        prompt.append("Bio: ").append(candidateProfile.getBio()).append("\n");
        prompt.append("CV Content:\n").append(candidateProfile.getExtractedCvText()).append("\n\n");

        // Part 2: List all job offers
        prompt.append("AVAILABLE JOB OFFERS:\n");
        for (int i = 0; i < jobOffers.size(); i++) {
            JobOffer offer = jobOffers.get(i);
            prompt.append("Job ID ").append(i).append(":\n");
            prompt.append("  ID: ").append(offer.getId()).append("\n");
            prompt.append("  Title: ").append(offer.getTitle()).append("\n");
            prompt.append("  Description: ").append(offer.getDescription()).append("\n");
            prompt.append("  Location: ").append(offer.getLocation()).append("\n");
            prompt.append("  Required Skills: ").append(offer.getRequiredSkills()).append("\n\n");
        }

        // Part 3: Instructions for Gemini
        prompt.append("TASK:\n");
        prompt.append("Analyze the candidate's profile, bio, and CV content.\n");
        prompt.append("For each job offer, calculate a relevance score (0-100) based on:\n");
        prompt.append("  - Skill match (does candidate have required skills?)\n");
        prompt.append("  - Experience level match (is their experience appropriate?)\n");
        prompt.append("  - Semantic match (do their background fit this job conceptually?)\n");
        prompt.append("Only include jobs with score Higher then 40.\n");
        prompt.append("Provide a brief reason (1-2 sentences) for each recommendation.\n\n");

        prompt.append("RESPONSE FORMAT - Return ONLY valid JSON (no markdown code blocks):\n");
        prompt.append("[\n");
        prompt.append("  {\"jobIndex\": 0, \"score\": 85, \"reason\": \"Strong match with ...\"},\n");
        prompt.append("  {\"jobIndex\": 1, \"score\": 72, \"reason\": \"Good experience in ...\"}\n");
        prompt.append("]\n");

        return prompt.toString();
    }

    /**
     * Parse the JSON response from Gemini and convert to RecommendationResponseDTOs.
     */
    private List<RecommendationResponseDTO> parseAiResponse(String aiResponse, List<JobOffer> jobOffers) {
        List<RecommendationResponseDTO> recommendations = new ArrayList<>();

        try {
            // Clean up AI response (remove markdown code blocks if present)
            String cleanedResponse = aiResponse
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            // Parse JSON array
            JsonNode rootNode = objectMapper.readTree(cleanedResponse);

            if (rootNode.isArray()) {
                for (JsonNode item : rootNode) {
                    int jobIndex = item.get("jobIndex").asInt();
                    double score = item.get("score").asDouble();
                    String reason = item.get("reason").asText();

                    if (jobIndex >= 0 && jobIndex < jobOffers.size()) {
                        JobOffer job = jobOffers.get(jobIndex);

                        // Create recommendation DTO
                        RecommendationResponseDTO recommendation = new RecommendationResponseDTO(
                                job.getId(),
                                job.getTitle(),
                                job.getDescription(),
                                job.getLocation(),
                                job.getContractType() != null ? job.getContractType().toString() : "Unknown",
                                job.getRequiredSkills(),
                                score,
                                reason
                        );

                        recommendations.add(recommendation);
                        log.debug("Added recommendation: {} with score {}", job.getTitle(), score);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", aiResponse, e);
            // Return empty list on error
        }

        return recommendations;
    }
}
