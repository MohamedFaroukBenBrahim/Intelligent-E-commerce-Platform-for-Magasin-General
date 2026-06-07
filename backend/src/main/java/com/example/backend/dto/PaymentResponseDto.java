package com.example.backend.dto;

import com.example.backend.entity.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentResponseDto {
    private Long orderId;
    private PaymentStatus status;
    private String transactionId;
    private String paymentUrl;
    private String message;
}
