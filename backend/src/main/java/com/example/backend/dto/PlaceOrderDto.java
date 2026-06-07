package com.example.backend.dto;

import com.example.backend.entity.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceOrderDto {
    private String shippingAddress;
    private PaymentMethod paymentMethod;
}
