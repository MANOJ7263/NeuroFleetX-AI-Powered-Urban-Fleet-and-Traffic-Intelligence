package com.neurofleetx.manager.controller;

import com.neurofleetx.trip.entity.Booking;
import com.neurofleetx.trip.entity.BookingStatus;
import com.neurofleetx.trip.service.BookingService;
import com.neurofleetx.vehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class ManagerController {

    private final VehicleService vehicleService;
    private final BookingService bookingService;

    @PutMapping("/vehicles/{id}/approve")
    public ResponseEntity<String> approveVehicle(@PathVariable Long id, @RequestParam boolean approved) {
        vehicleService.approveVehicle(id, approved);
        return ResponseEntity.ok("Vehicle approval status updated");
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }
}
