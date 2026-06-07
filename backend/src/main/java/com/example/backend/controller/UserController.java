package com.example.backend.controller;

import com.example.backend.dto.UpdateProfileDto;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/users")
@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** GET /users/me — get the authenticated user's profile */
    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    /** PUT /users/me — update basic profile info (username, phone) */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user,
                                           @RequestBody UpdateProfileDto dto) {
        try {
            User updated = userService.updateProfile(user, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** PATCH /users/me/picture — upload profile picture to MinIO under users/pictures/ */
    @PatchMapping(value = "/me/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfilePicture(@AuthenticationPrincipal User user,
                                                  @RequestPart("picture") MultipartFile picture) {
        try {
            User updated = userService.updateProfilePicture(user, picture);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // CV endpoints moved to CandidateProfileController (/candidates/me/cv)
}
