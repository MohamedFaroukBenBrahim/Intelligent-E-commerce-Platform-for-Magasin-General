package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlouciPaymentDto {
    private Long orderId;
    private String phoneNumber;
    private String email;
}
