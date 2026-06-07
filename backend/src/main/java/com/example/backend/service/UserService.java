package com.example.backend.service;

import com.example.backend.dto.RegisterUserDto;
import com.example.backend.dto.UpdateProfileDto;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MinioStorageService storageService;

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.bucket}")
    private String bucket;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, MinioStorageService storageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
    }

    public List<User> findAll() {
        List<User>users=new ArrayList<>();
        userRepository.findAll().forEach(users::add);
        return users;
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.findByNameOrEmail(keyword);
    }

    public User modifyUser(Long id, User modifyUser) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (modifyUser.getUsername() != null)
            existing.setUsername(modifyUser.getUsername());
        if (modifyUser.getEmail() != null)
            existing.setEmail(modifyUser.getEmail());
        if (modifyUser.getRole() != null)
            existing.setRole(modifyUser.getRole());
        if (modifyUser.getPassword() != null && !modifyUser.getPassword().isBlank())
            existing.setPassword(passwordEncoder.encode(modifyUser.getPassword()));
        return userRepository.save(existing);
    }

    public void enableordisableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    public User updateProfile(User currentUser, UpdateProfileDto dto) {
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            // Ensure no duplicate username
            userRepository.findByUsername(dto.getUsername())
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .ifPresent(u -> { throw new RuntimeException("Username already taken"); });
            currentUser.setUsername(dto.getUsername());
        }
        if (dto.getPhone() != null) currentUser.setPhone(dto.getPhone());
        if (dto.getAddress() != null) currentUser.setAddress(dto.getAddress());
        return userRepository.save(currentUser);
    }

    public User updateProfilePicture(User currentUser, MultipartFile picture) {
        // Delete old picture if it exists
        if (currentUser.getProfilePictureUrl() != null) {
            storageService.deleteFile(currentUser.getProfilePictureUrl());
        }
        String url = storageService.uploadFile(picture, "users/pictures");
        currentUser.setProfilePictureUrl(url);
        return userRepository.save(currentUser);
    }
    public User toggleUserHrStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == Role.USER) {
            user.setRole(Role.RH);
        } else if (user.getRole() == Role.RH) {
            user.setRole(Role.USER);
        }
        return userRepository.save(user);
    }
    // CV logic lives in CandidateProfileService
}
