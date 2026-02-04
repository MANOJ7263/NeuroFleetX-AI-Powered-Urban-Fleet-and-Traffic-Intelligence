package com.neurofleetx.vehicle.service;

import com.neurofleetx.vehicle.entity.Vehicle;
import com.neurofleetx.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final com.neurofleetx.auth.repository.UserRepository userRepository;
    private final com.neurofleetx.review.service.ReviewService reviewService;

    public Vehicle addVehicle(Vehicle vehicle, Long driverId) {
        if (driverId != null) {
            // Set driver
            var driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));
            vehicle.setDriver(driver);

            // Populate details from Driver User entity if missing
            if (vehicle.getDriverName() == null || vehicle.getDriverName().isEmpty()) {
                vehicle.setDriverName(driver.getName());
            }
            if (vehicle.getDriverPhone() == null || vehicle.getDriverPhone().isEmpty()) {
                vehicle.setDriverPhone(driver.getPhone());
            }

            // Find existing vehicles for this driver
            List<Vehicle> existing = vehicleRepository.findByDriverId(driverId);
            if (!existing.isEmpty()) {
                Vehicle existingVehicle = existing.get(0);
                // Reuse profile data if missing
                if (vehicle.getDriverPhoto() == null || vehicle.getDriverPhoto().isEmpty()) {
                    vehicle.setDriverPhoto(existingVehicle.getDriverPhoto());
                }
                if (vehicle.getDriverPhone() == null || vehicle.getDriverPhone().isEmpty()) {
                    vehicle.setDriverPhone(existingVehicle.getDriverPhone());
                }
            }
        }

        // Set defaults if missing
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(com.neurofleetx.vehicle.entity.VehicleStatus.AVAILABLE);
        }
        if (vehicle.getBatteryLevel() == null) {
            vehicle.setBatteryLevel(100.0);
        }
        if (vehicle.getCostPerHour() == null) {
            vehicle.setCostPerHour(50.0);
        }
        if (vehicle.getLicensePlate() == null || vehicle.getLicensePlate().isEmpty()) {
            vehicle.setLicensePlate(vehicle.getVehicleNumber());
        }
        vehicle.setActive(true);
        vehicle.setApproved(false); // Default to not approved
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return enrichVehicles(vehicleRepository.findByIsDeletedFalse());
    }

    public List<Vehicle> getApprovedVehicles() {
        return enrichVehicles(vehicleRepository.findByIsApprovedTrue());
    }

    public List<Vehicle> getPendingVehicles() {
        return enrichVehicles(vehicleRepository.findByIsApprovedFalse());
    }

    public List<Vehicle> getVehiclesByDriver(Long driverId) {
        return enrichVehicles(vehicleRepository.findByDriverId(driverId));
    }

    private List<Vehicle> enrichVehicles(List<Vehicle> vehicles) {
        for (Vehicle v : vehicles) {
            if (v.getDriver() != null) {
                Long driverId = v.getDriver().getId();
                v.getDriver().setDriverRatingLabel(reviewService.getDriverRating(driverId));
                v.getDriver().setTotalTrips(reviewService.getDriverTotalTrips(driverId));
            }
        }
        return vehicles;
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = getVehicleById(id);

        vehicle.setVehicleNumber(vehicleDetails.getVehicleNumber());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setType(vehicleDetails.getType());
        if (vehicleDetails.getBatteryLevel() != null)
            vehicle.setBatteryLevel(vehicleDetails.getBatteryLevel());
        if (vehicleDetails.getLatitude() != null)
            vehicle.setLatitude(vehicleDetails.getLatitude());
        if (vehicleDetails.getLongitude() != null)
            vehicle.setLongitude(vehicleDetails.getLongitude());
        if (vehicleDetails.getStatus() != null)
            vehicle.setStatus(vehicleDetails.getStatus());
        if (vehicleDetails.getCostPerHour() != null)
            vehicle.setCostPerHour(vehicleDetails.getCostPerHour());
        if (vehicleDetails.getLicensePlate() != null)
            vehicle.setLicensePlate(vehicleDetails.getLicensePlate());
        if (vehicleDetails.getBatteryPercentage() != null)
            vehicle.setBatteryPercentage(vehicleDetails.getBatteryPercentage());
        if (vehicleDetails.getSeatCapacity() != null)
            vehicle.setSeatCapacity(vehicleDetails.getSeatCapacity());

        return vehicleRepository.save(vehicle);
    }

    public void approveVehicle(Long id, boolean isApproved) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setApproved(isApproved);
        if (isApproved) {
            vehicle.setStatus(com.neurofleetx.vehicle.entity.VehicleStatus.AVAILABLE);
            vehicle.setActive(true);
        }
        vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setDeleted(true);
        vehicleRepository.save(vehicle);
    }

    // Keep existing deactivate for soft delete preference
    public void deactivateVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setActive(false);
        vehicle.setStatus(com.neurofleetx.vehicle.entity.VehicleStatus.MAINTENANCE);
        vehicleRepository.save(vehicle);
    }

    // Simulate battery drain and location updates for 'IN_USE' vehicles every 10
    // seconds
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 10000)
    public void simulateVehicleActivity() {
        List<Vehicle> activeVehicles = vehicleRepository
                .findByStatus(com.neurofleetx.vehicle.entity.VehicleStatus.IN_USE);
        java.util.Random random = new java.util.Random();

        for (Vehicle v : activeVehicles) {
            // Drain battery by 0.5% to 2.0%
            double drain = 0.5 + (1.5 * random.nextDouble());
            double newBattery = Math.max(0, v.getBatteryLevel() - drain);
            v.setBatteryLevel(newBattery);

            // Simulate location change (small random delta)
            if (v.getLatitude() != null && v.getLongitude() != null) {
                double latDelta = (random.nextDouble() - 0.5) * 0.001; // +/- ~100m
                double lonDelta = (random.nextDouble() - 0.5) * 0.001;
                v.setLatitude(v.getLatitude() + latDelta);
                v.setLongitude(v.getLongitude() + lonDelta);
            }

            vehicleRepository.save(v);
        }
    }
}
