package com.example.backend.controller;

import com.example.backend.dto.ChatRequest;
import com.example.backend.dto.AvatarResponse;
import com.example.backend.entity.Product;
import com.example.backend.service.AvatarAIService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/avatar")
public class AvatarController {

    private final AvatarAIService avatarAIService;

    public AvatarController(AvatarAIService avatarAIService) {
        this.avatarAIService = avatarAIService;
    }

    /**
     * Chat endpoint for avatar - processes user message and returns AI response with product recommendation
     * POST /avatar/chat
     * Body: { "message": "Can you recommend a laptop?", "context": "products" }
     * Response: { "chatResponse": "...", "recommendedProductId": 5, "emotion": "EXCITED", "audioUrl": null }
     */
    @PostMapping("/chat")
    public ResponseEntity<AvatarResponse> chat(@RequestBody ChatRequest chatRequest) {
        try {
            AvatarResponse response = avatarAIService.processMessage(chatRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new AvatarResponse(
                            "Sorry, I encountered an error. Please try again.",
                            new ArrayList<>(),
                            "SAD",
                        null,
                        new ArrayList<>()
                    ));
        }
    }

    /**
     * Get all discounted products for the avatar to recommend from
     * GET /avatar/products/discount
     */
    @GetMapping("/products/discount")
    public ResponseEntity<List<Product>> getDiscountedProducts() {
        List<Product> discountedProducts = avatarAIService.getAllDiscountedProducts();
        return ResponseEntity.ok(discountedProducts);
    }

    /**
     * Search and filter discounted products with pagination
     * GET /avatar/products/search?keyword=laptop&categoryId=1&minPrice=100&maxPrice=5000&state=active&page=0&size=10&sortBy=price&direction=desc
     */
    @GetMapping("/products/search")
    public ResponseEntity<Page<Product>> searchDiscountedProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Float minPrice,
            @RequestParam(required = false) Float maxPrice,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "discount") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageable = PageRequest.of(page, size, sort);
        Page<Product> results = avatarAIService.searchAndFilterDiscountedProducts(
            keyword, categoryId, minPrice, maxPrice, state, pageable
        );

        return ResponseEntity.ok(results);
    }
}
