package com.example.backend.service;

import com.example.backend.dto.JobOfferDto;
import com.example.backend.dto.JobOfferResponseDto;
import com.example.backend.entity.JobOffer;
import com.example.backend.entity.User;
import com.example.backend.repository.JobOfferRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;

    public JobOfferService(JobOfferRepository jobOfferRepository) {
        this.jobOfferRepository = jobOfferRepository;
    }

    // Story 74 — Users browse active offers
    public Page<JobOfferResponseDto> getActiveJobOffers(int page, int size) {
        return jobOfferRepository.findActiveOffers(PageRequest.of(page, size))
                .map(offer -> toDto(offer));
    }

    // Story 70 — RH views all offers (active + inactive)
    public Page<JobOfferResponseDto> getAllJobOffers(int page, int size) {
        return jobOfferRepository.findAllOffers(PageRequest.of(page, size))
                .map(offer -> toDto(offer));
    }

    public JobOfferResponseDto getJobOfferById(Long id) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));
        return toDto(offer);
    }

    // Story 68 — RH creates an offer
    public JobOfferResponseDto createJobOffer(User rh, JobOfferDto dto) {
        JobOffer offer = new JobOffer();
        offer.setTitle(dto.getTitle());
        offer.setDescription(dto.getDescription());
        offer.setLocation(dto.getLocation());
        offer.setContractType(dto.getContractType());
        offer.setRequiredSkills(dto.getRequiredSkills());
        offer.setPostedBy(rh);
        return toDto(jobOfferRepository.save(offer));
    }

    // Story 71 — RH updates an offer
    public JobOfferResponseDto updateJobOffer(Long id, JobOfferDto dto) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));
        if (dto.getTitle() != null) offer.setTitle(dto.getTitle());
        if (dto.getDescription() != null) offer.setDescription(dto.getDescription());
        if (dto.getLocation() != null) offer.setLocation(dto.getLocation());
        if (dto.getContractType() != null) offer.setContractType(dto.getContractType());
        if (dto.getRequiredSkills() != null) offer.setRequiredSkills(dto.getRequiredSkills());
        if (dto.getActive() != null) offer.setActive(dto.getActive());
        return toDto(jobOfferRepository.save(offer));
    }

    // Story 69 — RH deletes an offer
    public void deleteJobOffer(Long id) {
        if (!jobOfferRepository.existsById(id)) {
            throw new RuntimeException("Job offer not found");
        }
        jobOfferRepository.deleteById(id);
    }

    private JobOfferResponseDto toDto(JobOffer offer) {
        JobOfferResponseDto dto = new JobOfferResponseDto();
        dto.setId(offer.getId());
        dto.setTitle(offer.getTitle());
        dto.setDescription(offer.getDescription());
        dto.setLocation(offer.getLocation());
        dto.setContractType(offer.getContractType());
        dto.setRequiredSkills(offer.getRequiredSkills());
        dto.setActive(offer.isActive());
        dto.setPostedAt(offer.getPostedAt());
        dto.setUpdatedAt(offer.getUpdatedAt());
        dto.setPostedByUsername(offer.getPostedBy() != null ? offer.getPostedBy().getUsername() : null);
        dto.setApplicationCount(offer.getApplications() != null ? offer.getApplications().size() : 0);
        return dto;
    }
}
