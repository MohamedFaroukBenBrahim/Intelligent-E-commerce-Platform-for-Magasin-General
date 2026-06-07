package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class ChatResponse {

    private String response;

    public ChatResponse() {}

    public ChatResponse(String response) {
        this.response = response;
    }
}