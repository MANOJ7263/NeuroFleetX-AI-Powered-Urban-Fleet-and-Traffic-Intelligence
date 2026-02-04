package com.neurofleetx.auth.controller;

import com.neurofleetx.auth.entity.Role;
import com.neurofleetx.auth.entity.User;
import com.neurofleetx.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/drivers")
    public ResponseEntity<List<User>> getDrivers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.DRIVER));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(@org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam com.neurofleetx.auth.entity.UserStatus status) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        User user = userRepository.findByEmail(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @org.springframework.web.bind.annotation.RequestBody UserProfileUpdateDTO updateDTO) {
        try {
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            String currentPrincipalName = authentication.getName();
            User user = userRepository.findByEmail(currentPrincipalName)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update fields if provided
            if (updateDTO.getName() != null && !updateDTO.getName().trim().isEmpty()) {
                user.setName(updateDTO.getName());
            }
            if (updateDTO.getPhone() != null) {
                user.setPhone(updateDTO.getPhone());
            }
            if (updateDTO.getPhotoUrl() != null) {
                // Log the photo URL length for debugging
                System.out.println("Updating photo URL, length: " + updateDTO.getPhotoUrl().length());
                user.setPhotoUrl(updateDTO.getPhotoUrl());
            }

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    // Error response class
    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    // DTO class for profile updates
    public static class UserProfileUpdateDTO {
        private String name;
        private String phone;
        private String photoUrl;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }
    }
}
