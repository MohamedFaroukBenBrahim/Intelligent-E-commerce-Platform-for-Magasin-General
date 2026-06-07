package com.example.backend.dto;

import com.example.backend.entity.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusDto {
    private OrderStatus status;
}
