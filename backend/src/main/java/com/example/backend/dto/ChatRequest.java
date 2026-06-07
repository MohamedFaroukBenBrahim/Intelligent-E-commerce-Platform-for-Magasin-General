package com.example.backend.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {

    private String message;
    private String context;

    public ChatRequest() {}

    public ChatRequest(String message, String context) {
        this.message = message;
        this.context = context;
    }

}