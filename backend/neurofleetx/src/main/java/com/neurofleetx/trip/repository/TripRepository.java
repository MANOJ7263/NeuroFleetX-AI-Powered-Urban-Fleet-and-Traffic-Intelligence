package com.neurofleetx.trip.repository;

import com.neurofleetx.trip.entity.Trip;
import com.neurofleetx.trip.entity.TripStatus;
import com.neurofleetx.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByStatus(TripStatus status);

    List<Trip> findByDriver(User driver);

    List<Trip> findByCustomer(User customer);

    Optional<Trip> findByDriverIdAndStatus(Long driverId, TripStatus tripStatus);

    // Naive search for potential matches, logic will be refined in Service
    List<Trip> findByPickupLocationOrRoutePathContaining(String pickupLocation, String routePathPart);
}
