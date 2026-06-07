package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Fields every user can update on their basic profile.
 * Recruitment-specific fields (bio, title) live in CandidateProfileDto.
 */
@Getter
@Setter
public class UpdateProfileDto {
    private String username;
    private String phone;
    private String address;
}
