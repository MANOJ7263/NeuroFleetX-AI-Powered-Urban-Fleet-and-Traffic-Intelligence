package com.neurofleetx.vehicle.repository;

import com.neurofleetx.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    java.util.List<Vehicle> findByStatus(com.neurofleetx.vehicle.entity.VehicleStatus status);

    java.util.List<Vehicle> findByIsDeletedFalse();

    java.util.List<Vehicle> findByDriverId(Long driverId);

    java.util.List<Vehicle> findByIsApprovedFalse();

    List<Vehicle> findByIsApprovedTrue();
}
