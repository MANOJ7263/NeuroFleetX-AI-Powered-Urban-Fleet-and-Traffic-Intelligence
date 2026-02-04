package com.neurofleetx.vehicle.service;

import com.neurofleetx.vehicle.entity.Vehicle;
import com.neurofleetx.vehicle.entity.VehicleStatus;
import com.neurofleetx.vehicle.repository.VehicleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TelemetryService {

    private final VehicleRepository vehicleRepository;

    public TelemetryService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void simulateTelemetry() {
        List<Vehicle> inUseVehicles = vehicleRepository.findByStatus(VehicleStatus.IN_USE);

        for (Vehicle vehicle : inUseVehicles) {
            // Simulate battery drop (1%)
            double currentBattery = vehicle.getBatteryLevel();
            if (currentBattery > 0) {
                vehicle.setBatteryLevel(Math.max(0, currentBattery - 1.0));
                // Sync the other field if it exists and is used
                // vehicle.setBatteryPercentage(vehicle.getBatteryLevel());
            }

            // Simulate mileage increase/update location (Just a placeholder for mileage as
            // Vehicle doesn't have mileage field strictly,
            // but prompt says "2km mileage increase". Vehicle entity doesn't have 'mileage'
            // or 'totalDistance'.
            // I will assume latitude/longitude change or maybe I should add mileage field?
            // Checking Vehicle.java... it has latitude/longitude.
            // Prompt: "simulate a 1% battery drop and 2km mileage increase per minute".
            // Since there is no mileage field, I should probably add one or just log it?
            // Or maybe "mileage" implies updating the trip distance? But this is vehicle
            // telemetry.
            // I'll add a 'totalKilometers' field to Vehicle if it's not there.
            // Looking at Vehicle.java again... no mileage field.
            // I will add a 'totalKilometers' to Vehicle first. Since I can't check it right
            // now (I saw it earlier and it wasn't there), I'll add it in a subsequent step
            // or just ignore if strict?
            // Prompt "Specific Tasks... simulate... 2km mileage increase". This implies
            // persistent state.
            // I will update Vehicle to add `totalKilometers`.

            // For now, I'll update coordinates slightly to simulate movement
            if (vehicle.getLatitude() != null && vehicle.getLongitude() != null) {
                vehicle.setLatitude(vehicle.getLatitude() + 0.001);
                vehicle.setLongitude(vehicle.getLongitude() + 0.001);
            }
        }

        vehicleRepository.saveAll(inUseVehicles);
    }
}
