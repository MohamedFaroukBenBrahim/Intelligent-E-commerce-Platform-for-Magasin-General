package com.example.backend.service;

import com.example.backend.entity.ContractType;
import com.example.backend.entity.Product;
import com.example.backend.repository.JobOfferRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatContextService {

    private static final int MAX_JOBS_IN_CONTEXT = 10;
    private static final int MAX_PRODUCTS_IN_CONTEXT = 50;
    private static final Set<String> PRODUCT_SEARCH_STOP_WORDS = Set.of(
            "do", "you", "have", "show", "me", "i", "want", "is", "there",
            "what", "the", "price", "of", "how", "much", "tell", "about",
            "can", "please", "a", "an", "for", "mg", "magasin", "general"
    );

    private final JobOfferRepository jobOfferRepository;
    private final ProductRepository productRepository;

    public ChatContextService(JobOfferRepository jobOfferRepository,
                              ProductRepository productRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.productRepository = productRepository;
    }

    // ── Jobs context — only active jobs, no limit needed (usually few jobs)
    public String getActiveJobsContext() {
        var jobs = jobOfferRepository.findActiveOffers(Pageable.ofSize(MAX_JOBS_IN_CONTEXT)).getContent();
        if (jobs.isEmpty()) return "No active job offers at the moment.";

        long internshipCount = jobs.stream()
            .filter(job -> isInternship(job.getContractType(), job.getTitle(), job.getDescription()))
            .count();

        StringBuilder sb = new StringBuilder("ACTIVE JOB OFFERS:\n");
        sb.append("Total active offers: ").append(jobs.size()).append("\n");
        sb.append("Internship offers: ").append(internshipCount).append("\n");
        jobs.forEach(job -> {
            sb.append("---\n");
            sb.append("Job ID: ").append(job.getId()).append("\n");
            sb.append("Title: ").append(job.getTitle()).append("\n");
            sb.append("Location: ").append(job.getLocation()).append("\n");
            sb.append("Contract: ").append(job.getContractType()).append("\n");
            sb.append("Internship: ").append(
                isInternship(job.getContractType(), job.getTitle(), job.getDescription()) ? "Yes" : "No"
            ).append("\n");
            sb.append("Skills: ").append(job.getRequiredSkills()).append("\n");
        });
        return sb.toString();
    }

        private boolean isInternship(ContractType contractType, String title, String description) {
        if (contractType == ContractType.STAGE || contractType == ContractType.ALTERNANCE) {
            return true;
        }

        String text = ((title == null ? "" : title) + " " + (description == null ? "" : description))
            .toLowerCase(Locale.ROOT);

        return text.contains("intern")
            || text.contains("internship")
            || text.contains("stage")
            || text.contains("alternance")
            || text.contains("trainee");
        }

    // ── Smart product search — only fetch products matching the user's question
    public String searchProductsContext(String userMessage) {
        String normalizedMessage = normalizeMessage(userMessage);
        List<String> keywords = extractKeywords(normalizedMessage);

        Map<Long, Product> matchesById = new LinkedHashMap<>();

        if (!normalizedMessage.isBlank()) {
            productRepository
                    .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(normalizedMessage, normalizedMessage)
                    .forEach(product -> matchesById.put(product.getId(), product));
        }

        for (String keyword : keywords) {
            productRepository
                    .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword)
                    .forEach(product -> matchesById.put(product.getId(), product));
        }

        List<Product> products = new ArrayList<>(matchesById.values());
        if (products.isEmpty()) {
            products = productRepository.findAll(Pageable.ofSize(MAX_PRODUCTS_IN_CONTEXT)).getContent();
        }

        if (products.isEmpty()) {
            return "No products found matching the query.";
        }

        products.sort(Comparator
                .comparingInt((Product p) -> scoreProduct(p, keywords, normalizedMessage))
                .reversed()
                .thenComparing(Product::getName, String.CASE_INSENSITIVE_ORDER));

        StringBuilder sb = new StringBuilder("RELEVANT PRODUCTS:\n");
        products.stream().limit(MAX_PRODUCTS_IN_CONTEXT).forEach(product -> {
            sb.append("---\n");
            sb.append("Product ID: ").append(product.getId()).append("\n");
            sb.append("Name: ").append(product.getName()).append("\n");
            sb.append("Category: ").append(getCategoryName(product)).append("\n");
            sb.append("Price: ").append(product.getPrice()).append(" TND\n");
            sb.append("Stock: ").append(product.getQuantity()).append("\n");
            if (product.getState() != null && !product.getState().isBlank()) {
                sb.append("State: ").append(product.getState()).append("\n");
            }
            if (product.getDiscount() != null && product.getDiscount() > 0) {
                sb.append("Discount: ").append(product.getDiscount()).append("%\n");
            }
            if (product.getDescription() != null && !product.getDescription().isBlank()) {
                sb.append("Description: ").append(product.getDescription()).append("\n");
            }
        });

        return sb.toString();
    }

    private String normalizeMessage(String message) {
        if (message == null) return "";
        return message.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private List<String> extractKeywords(String normalizedMessage) {
        if (normalizedMessage == null || normalizedMessage.isBlank()) {
            return List.of();
        }

        return Arrays.stream(normalizedMessage.split(" "))
                .map(String::trim)
                .filter(token -> token.length() >= 2)
                .filter(token -> !PRODUCT_SEARCH_STOP_WORDS.contains(token))
                .distinct()
                .collect(Collectors.toList());
    }

    private int scoreProduct(Product product, List<String> keywords, String normalizedMessage) {
        String name = product.getName() != null ? product.getName().toLowerCase(Locale.ROOT) : "";
        String description = product.getDescription() != null ? product.getDescription().toLowerCase(Locale.ROOT) : "";
        String categoryName = getCategoryName(product).toLowerCase(Locale.ROOT);

        int score = 0;
        if (!normalizedMessage.isBlank()) {
            if (name.contains(normalizedMessage)) score += 8;
            if (description.contains(normalizedMessage)) score += 4;
            if (categoryName.contains(normalizedMessage)) score += 3;
        }
        for (String keyword : keywords) {
            if (name.contains(keyword)) score += 5;
            if (description.contains(keyword)) score += 2;
            if (categoryName.contains(keyword)) score += 2;
        }
        return score;
    }

    private String getCategoryName(Product product) {
        if (product.getCategorie() == null || product.getCategorie().getName() == null) {
            return "N/A";
        }
        return product.getCategorie().getName();
    }
}