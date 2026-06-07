package com.example.backend.service;

import com.example.backend.dto.ChatRequest;
import com.example.backend.dto.AvatarResponse;
import com.example.backend.entity.Product;
import com.example.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AvatarAIService {
    private static final Logger log = LoggerFactory.getLogger(AvatarAIService.class);

    private final ChatClient chatClient;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final ElevenLabsService elevenLabsService;
    private final RhubarService rhubarService;
    private final MinioStorageService minioStorageService;

    @Value("${avatar.audio-upload-folder:avatar/audio}")
    private String audioUploadFolder;

    // Emotion keywords mapping
    private static final Map<String, String> EMOTION_KEYWORDS = Map.ofEntries(
            Map.entry("EXCITED", "amazing|great|awesome|fantastic|excellent|perfect|love|wonderful"),
            Map.entry("HAPPY", "good|nice|glad|happy|pleased|recommend|suggest"),
            Map.entry("CONFUSED", "confused|unsure|not sure|unclear|maybe|perhaps"),
            Map.entry("SAD", "sorry|apologize|problem|error|issue|cannot|can't|unable"),
            Map.entry("THINKING", "let me|consider|thinking|calculate|check"));

    public AvatarAIService(ChatClient chatClient, ProductRepository productRepository,
            ProductService productService,
            ElevenLabsService elevenLabsService,
            RhubarService rhubarService,
            MinioStorageService minioStorageService) {
        this.chatClient = chatClient;
        this.productRepository = productRepository;
        this.productService = productService;
        this.elevenLabsService = elevenLabsService;
        this.rhubarService = rhubarService;
        this.minioStorageService = minioStorageService;
    }

    /**
     * Process user chat message and generate AI response with product
     * recommendation
     */
    public AvatarResponse processMessage(ChatRequest chatRequest) {
        Path generatedAudioFile = null;
        try {
            String userMessage = chatRequest.getMessage();
            String context = chatRequest.getContext();

            log.info("Processing message: {} with context: {}", userMessage, context);

            // Get discount products for context
            List<Product> discountedProducts = getDiscountedProducts();

            // Build AI prompt with product context
            String aiPrompt = buildAIPrompt(userMessage, context, discountedProducts);

            // Call Llama AI to get response
            String aiResponse = callLlamaAI(aiPrompt);

            // Extract product IDs from AI response (can be multiple)
            List<Long> recommendedProductIds = extractProductIdsFromResponse(aiResponse, discountedProducts);

            // Fetch actual Product objects for recommended IDs
            List<Product> recommendedProducts = new ArrayList<>();
            if (recommendedProductIds != null && !recommendedProductIds.isEmpty()) {
                recommendedProducts = productRepository.findAllById(recommendedProductIds);
            }

            // Detect emotion from AI response
            String detectedEmotion = detectEmotion(aiResponse);

            // Extract chat response text
            String chatResponseText = extractChatResponseText(aiResponse);

            String audioUrl = null;
            List<VisemeData> visemes = new ArrayList<>();
            try {
                generatedAudioFile = elevenLabsService.synthesizeSpeech(chatResponseText);
                visemes = rhubarService.extractVisemes(generatedAudioFile);
                audioUrl = minioStorageService.uploadPath(generatedAudioFile, audioUploadFolder, "audio/mpeg");
            } catch (Exception audioException) {
                log.warn("Audio generation or lip-sync failed, returning text response only", audioException);
            } finally {
                if (generatedAudioFile != null) {
                    try {
                        Files.deleteIfExists(generatedAudioFile);
                    } catch (Exception cleanupError) {
                        log.debug("Could not delete temporary audio file {}", generatedAudioFile, cleanupError);
                    }
                }
            }

            return new AvatarResponse(chatResponseText, recommendedProducts, detectedEmotion, audioUrl, visemes);

        } catch (Exception e) {
            log.error("Error processing message", e);
            return new AvatarResponse(
                    "Sorry, I encountered an error processing your request. Please try again.",
                    new ArrayList<>(),
                    "SAD",
                    null,
                    new ArrayList<>());
        }
    }

    /**
     * Get all products with discount
     */
    private List<Product> getDiscountedProducts() {
        return productService.getAllProducts().stream()
                .filter(p -> p.getDiscount() != null && p.getDiscount() > 0)
                .collect(Collectors.toList());
    }

    /**
     * Build AI prompt with product context
     */
    private String buildAIPrompt(String userMessage, String context, List<Product> discountedProducts) {
        StringBuilder productContext = new StringBuilder("Available discounted products:\n");

        for (Product product : discountedProducts) {
            productContext.append(String.format(
                    "ID: %d, Name: %s, Price: $%.2f, Discount: %d%%, Description: %s\n",
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    product.getDiscount().intValue(),
                    product.getDescription() != null ? product.getDescription() : "N/A"));
        }

        return String.format(
                "You are an AI shopping assistant for an e-commerce platform. " +
                        "You are friendly, helpful, and recommend products enthusiastically.\n\n" +
                        (context != null && !context.isBlank() ? "Frontend context:\n%s\n\n" : "") +
                        "%s\n\n" +
                        "User request: %s\n\n" +
                        "Please help the user and if relevant, recommend one or more of the available products by mentioning their names. "
                        +
                        "If you recommend products, include their IDs in square brackets like [ID: 5] and [ID: 8]. " +
                        "You can recommend multiple products if they are suitable for the user's needs. " +
                        "Keep your response concise and engaging.",
                context != null && !context.isBlank() ? context : "",
                productContext.toString(),
                userMessage);
    }

    /**
     * Call Llama AI via Spring AI ChatClient
     */
    private String callLlamaAI(String prompt) {
        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.debug("AI Response: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Error calling Llama AI", e);
            throw new RuntimeException("Failed to call AI service", e);
        }
    }

    /**
     * Extract product IDs from AI response
     * Looks for pattern [ID: NUMBER] (can be multiple)
     */
    private List<Long> extractProductIdsFromResponse(String response, List<Product> availableProducts) {
        List<Long> productIds = new ArrayList<>();
        // Pattern to find all [ID: NUMBER] occurrences
        Pattern pattern = Pattern.compile("\\[ID:\\s*(\\d+)\\]");
        Matcher matcher = pattern.matcher(response);

        while (matcher.find()) {
            try {
                Long productId = Long.parseLong(matcher.group(1));
                // Verify product exists and has discount
                Optional<Product> product = availableProducts.stream()
                        .filter(p -> p.getId().equals(productId))
                        .findFirst();
                if (product.isPresent() && !productIds.contains(productId)) {
                    productIds.add(productId);
                }
            } catch (NumberFormatException e) {
                log.warn("Could not parse product ID from response");
            }
        }
        return productIds.isEmpty() ? null : productIds;
    }

    /**
     * Detect emotion from AI response
     */
    private String detectEmotion(String response) {
        String lowerResponse = response.toLowerCase();

        for (Map.Entry<String, String> emotionEntry : EMOTION_KEYWORDS.entrySet()) {
            String emotion = emotionEntry.getKey();
            String keywords = emotionEntry.getValue();
            Pattern pattern = Pattern.compile("\\b(" + keywords + ")\\b");

            if (pattern.matcher(lowerResponse).find()) {
                return emotion;
            }
        }

        // Default emotion
        return "HAPPY";
    }

    /**
     * Extract clean chat response text (remove [ID: ...] patterns)
     */
    private String extractChatResponseText(String response) {
        // Remove [ID: NUMBER] pattern from response
        return response.replaceAll("\\[ID:\\s*\\d+\\]", "").trim();
    }

    /**
     * Search and filter discounted products with pagination
     */
    public Page<Product> searchAndFilterDiscountedProducts(String keyword, Long categoryId, Float minPrice,
            Float maxPrice, String state, Pageable pageable) {
        return productRepository.searchAndFilterDiscounted(keyword, categoryId, minPrice, maxPrice, state, pageable);
    }

    /**
     * Search products by keyword and get discounted ones
     */
    public List<Product> searchDiscountedProducts(String keyword) {
        List<Product> results = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                keyword, keyword);

        return results.stream()
                .filter(p -> p.getDiscount() != null && p.getDiscount() > 0)
                .collect(Collectors.toList());
    }

    /**
     * Get all discounted products with sorting
     */
    public List<Product> getAllDiscountedProducts() {
        return getDiscountedProducts();
    }
}
