package com.example.backend.dto;

import com.example.backend.entity.ContractType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobOfferDto {
    private String title;
    private String description;
    private String location;
    private ContractType contractType;
    private String requiredSkills;
    private Boolean active;
}
