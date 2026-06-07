package com.example.backend.dto;

import com.example.backend.entity.Product;
import com.example.backend.service.VisemeData;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AvatarResponse {

    private String chatResponse;
    private List<Product> recommendedProducts;
    private String emotion;
    private String audioUrl;
    private List<VisemeData> visemes;
    // Constructor for backward compatibility with single product
    public AvatarResponse(String chatResponse) {
        this.chatResponse = chatResponse;
    }

    // Constructor with single product
    public AvatarResponse(String chatResponse, Product product, String emotion, String audioUrl) {
        this.chatResponse = chatResponse;
        this.recommendedProducts = product != null ? List.of(product) : null;
        this.emotion = emotion;
        this.audioUrl = audioUrl;
    }

}


