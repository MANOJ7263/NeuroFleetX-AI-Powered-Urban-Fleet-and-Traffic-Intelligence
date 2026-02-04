package com.neurofleetx.trip.controller;

import com.neurofleetx.auth.repository.UserRepository;
import com.neurofleetx.trip.entity.Booking;
import com.neurofleetx.trip.service.BookingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request, Authentication authentication) {
        Long customerId = extractUserId(authentication);
        return ResponseEntity.ok(bookingService.createBooking(
                customerId,
                request.getTripOfferId(),
                request.getPickupLocation(),
                request.getDropLocation(),
                request.getDistanceKm(),
                request.isOneWay()));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public ResponseEntity<java.util.List<Booking>> getMyBookings(Authentication authentication) {
        Long customerId = extractUserId(authentication);
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(customerId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<java.util.List<Booking>> getPendingBookings() {
        return ResponseEntity.ok(bookingService.getPendingBookings());
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/driver/requests")
    public ResponseEntity<java.util.List<Booking>> getDriverRequests(Authentication authentication) {
        Long driverId = extractUserId(authentication);
        return ResponseEntity.ok(bookingService.getDriverPendingBookings(driverId));
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/driver/confirmed")
    public ResponseEntity<java.util.List<Booking>> getDriverConfirmed(Authentication authentication) {
        Long driverId = extractUserId(authentication);
        return ResponseEntity.ok(bookingService.getDriverConfirmedBookings(driverId));
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
        Long driverId = extractUserId(authentication);
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, driverId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'DRIVER')")
    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<Booking> confirmBooking(@PathVariable Long bookingId) {
        return ResponseEntity
                .ok(bookingService.updateBookingStatus(bookingId, com.neurofleetx.trip.entity.BookingStatus.CONFIRMED));
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null)
            return null;
        return userRepository.findByEmail(authentication.getName())
                .map(com.neurofleetx.auth.entity.User::getId).orElse(null);
    }

    @Data
    public static class BookingRequest {
        private Long tripOfferId;
        private String pickupLocation;
        private String dropLocation;
        private Double distanceKm;
        private boolean oneWay;
    }
}
