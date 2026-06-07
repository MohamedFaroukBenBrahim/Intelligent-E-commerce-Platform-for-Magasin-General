package com.example.backend.controller;

import com.example.backend.dto.ChatRequest;
import com.example.backend.dto.ChatResponse;
import com.example.backend.service.ChatContextService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
public class chatController {

    private final ChatClient chatClient;
    private final ChatContextService chatContextService;

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant for mg (Magasin Général), Tunisia's leading retail chain.
            You will be given real-time data from the platform's database to help you answer accurately.
            Use this data to give precise, helpful answers.
            Never invent products, prices, ratings, or job offers.
            If the data doesn't contain what the user is asking about, say so honestly.
            Answer in the same language the user writes in.
            IMPORTANT: Never use Markdown formatting in your responses.
            No asterisks, no bullet points with *, no **bold**, no *italic*.
            Use plain text only. Use dashes (-) for lists if needed. DATA :
            """;

    public chatController(ChatClient.Builder builder, ChatContextService chatContextService) {
        this.chatClient = builder
                .defaultSystem(SYSTEM_PROMPT)
                .build();
        this.chatContextService = chatContextService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String context = request.getContext() != null ? request.getContext() : "general";

            // Route to different contexts
            String dbContext = resolveContextByType(context, request.getMessage());
            String enrichedPrompt = dbContext + "\n\nUser question: " + request.getMessage();

            String aiResponse = chatClient.prompt()
                    .user(enrichedPrompt)
                    .call()
                    .content();

            return ResponseEntity.ok(new ChatResponse(aiResponse));

        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                return ResponseEntity.status(429)
                        .body(new ChatResponse("I'm temporarily busy, please try again in a moment."));
            }
            return ResponseEntity.status(500)
                    .body(new ChatResponse("Something went wrong, please try again."));
        }
    }

    private String resolveContextByType(String context, String message) {
        if (context == null || context.equals("general")) {
            return ""; // General context - no database context needed
        }
        if (context.equals("jobs")) {
            return chatContextService.getActiveJobsContext();
        }
        if (context.equals("products")) {
            return chatContextService.searchProductsContext(message);
        }
        return ""; // fallback
    }
}