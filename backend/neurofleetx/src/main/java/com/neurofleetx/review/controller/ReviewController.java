package com.neurofleetx.review.controller;

import com.neurofleetx.review.entity.Review;
import com.neurofleetx.review.service.ReviewService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin
public class ReviewController {

    private final ReviewService reviewService;
    private final com.neurofleetx.auth.repository.UserRepository userRepository;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<Review> submitReview(
            @RequestBody ReviewRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        Long customerId = userRepository.findByEmail(email)
                .map(com.neurofleetx.auth.entity.User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(reviewService.submitReview(
                customerId,
                request.getVehicleId(),
                request.getRating(),
                request.getContent()));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(reviewService.getReviewsForVehicle(vehicleId));
    }

    @Data
    public static class ReviewRequest {
        private Long vehicleId;
        private Integer rating;
        private String content;
    }
}
