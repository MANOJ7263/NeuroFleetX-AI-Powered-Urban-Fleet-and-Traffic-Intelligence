package com.neurofleetx.vehicle.controller;

import com.neurofleetx.vehicle.entity.Vehicle;
import com.neurofleetx.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin
public class VehicleController {

    private final VehicleService vehicleService;
    private final com.neurofleetx.auth.repository.UserRepository userRepository;

    // ADMIN, MANAGER, DRIVER
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DRIVER')")
    @PostMapping
    public ResponseEntity<?> addVehicle(@Valid @RequestBody Vehicle vehicle,
            org.springframework.security.core.Authentication authentication) {
        try {
            Long userId = extractUserId(authentication);
            System.out.println("Adding vehicle for user ID: " + userId);

            if (vehicle.getVehiclePhoto() != null) {
                System.out.println("Vehicle photo length: " + vehicle.getVehiclePhoto().length());
            }
            if (vehicle.getDriverPhoto() != null) {
                System.out.println("Driver photo length: " + vehicle.getDriverPhoto().length());
            }

            Vehicle savedVehicle = vehicleService.addVehicle(vehicle, userId);
            System.out.println("Vehicle added successfully with ID: " + savedVehicle.getId());
            return ResponseEntity.ok(savedVehicle);
        } catch (Exception e) {
            System.err.println("Error adding vehicle: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to add vehicle: " + e.getMessage()));
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

    private Long extractUserId(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getName() == null)
            return null;
        return userRepository.findByEmail(authentication.getName())
                .map(com.neurofleetx.auth.entity.User::getId).orElse(null);
    }

    // ADMIN, MANAGER, DRIVER (read-only)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DRIVER')")
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/my")
    public ResponseEntity<List<Vehicle>> getMyVehicles(
            org.springframework.security.core.Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(vehicleService.getVehiclesByDriver(userId));
    }

    // ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deactivateVehicle(@PathVariable Long id) {
        vehicleService.deactivateVehicle(id);
        return ResponseEntity.ok("Vehicle deactivated");
    }

    // ADMIN & MANAGER
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicle));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveVehicle(@PathVariable Long id) {
        vehicleService.approveVehicle(id, true);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{id}/deny")
    public ResponseEntity<Void> denyVehicle(@PathVariable Long id) {
        vehicleService.approveVehicle(id, false);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/pending")
    public ResponseEntity<List<Vehicle>> getPendingVehicles() {
        return ResponseEntity.ok(vehicleService.getPendingVehicles());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/approved")
    public ResponseEntity<List<Vehicle>> getApprovedVehicles() {
        return ResponseEntity.ok(vehicleService.getApprovedVehicles());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}/toggle-approval")
    public ResponseEntity<Vehicle> toggleApproval(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        boolean newState = !vehicle.isApproved();
        vehicleService.approveVehicle(id, newState);
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }
}
