package com.example.backend.dto;

import com.example.backend.entity.ApplicationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusDto {
    private ApplicationStatus status;
}
