package com.example.backend.dto;

import com.example.backend.entity.ContractType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobOfferResponseDto {
    private Long id;
    private String title;
    private String description;
    private String location;
    private ContractType contractType;
    private String requiredSkills;
    private boolean active;
    private LocalDateTime postedAt;
    private LocalDateTime updatedAt;
    private String postedByUsername;
    private int applicationCount;
}
