package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Fields the candidate can update on their recruitment profile.
 */
@Getter
@Setter
public class CandidateProfileDto {
    private String bio;
    private String title;
}
