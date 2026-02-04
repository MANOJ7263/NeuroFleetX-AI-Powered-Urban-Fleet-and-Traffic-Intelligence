package com.neurofleetx.trip.service;

import com.neurofleetx.trip.entity.Trip;
import com.neurofleetx.trip.entity.TripStatus;
import com.neurofleetx.trip.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final com.neurofleetx.auth.repository.UserRepository userRepository;
    private final com.neurofleetx.vehicle.repository.VehicleRepository vehicleRepository;

    public TripService(TripRepository tripRepository,
            com.neurofleetx.auth.repository.UserRepository userRepository,
            com.neurofleetx.vehicle.repository.VehicleRepository vehicleRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public Optional<Trip> getCurrentTripForDriver(Long driverId) {
        return tripRepository.findByDriverIdAndStatus(driverId, TripStatus.ASSIGNED);
    }

    public java.util.List<Trip> getPendingTrips() {
        return tripRepository.findByStatus(TripStatus.REQUESTED);
    }

    public Trip requestTrip(Long customerId, com.neurofleetx.trip.dto.TripRequestDTO request) {
        com.neurofleetx.auth.entity.User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Trip trip = Trip.builder()
                .customer(customer)
                .pickupLocation(request.getPickupLocation())
                .dropLocation(request.getDropLocation())
                .status(TripStatus.REQUESTED)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        return tripRepository.save(trip);
    }

    @org.springframework.transaction.annotation.Transactional
    public Trip assignTrip(Long tripId, Long driverId, Long vehicleId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.getStatus().equals(TripStatus.REQUESTED)) {
            throw new RuntimeException("Trip is not in REQUESTED status");
        }

        com.neurofleetx.auth.entity.User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // checking role could be done here if User has checkRole method, assuming
        // generic User for now

        com.neurofleetx.vehicle.entity.Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getStatus().equals(com.neurofleetx.vehicle.entity.VehicleStatus.AVAILABLE)) {
            throw new RuntimeException("Vehicle is not available");
        }

        // Update Trip
        trip.setDriver(driver);
        trip.setVehicle(vehicle);
        trip.setStatus(TripStatus.ASSIGNED);

        // Update Vehicle
        vehicle.setStatus(com.neurofleetx.vehicle.entity.VehicleStatus.BOOKED);
        vehicleRepository.save(vehicle);

        return tripRepository.save(trip);
    }

    @org.springframework.transaction.annotation.Transactional
    public Trip startTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getStatus() != TripStatus.ASSIGNED) {
            throw new RuntimeException("Trip must be assigned before starting");
        }

        trip.setStatus(TripStatus.STARTED);
        trip.setStartedAt(java.time.LocalDateTime.now());

        com.neurofleetx.vehicle.entity.Vehicle vehicle = trip.getVehicle();
        if (vehicle != null) {
            vehicle.setStatus(com.neurofleetx.vehicle.entity.VehicleStatus.IN_USE);
            vehicleRepository.save(vehicle);
        }

        return tripRepository.save(trip);
    }

    /**
     * Advanced Routing Logic: Sub-Route Matching
     * Finds trips where the requested 'from' -> 'to' is a sub-segment of an
     * existing trip.
     */
    public java.util.List<Trip> findMatchingTrips(String from, String to) {
        // 1. Get potential candidates (where start matches pickup or is in route)
        java.util.List<Trip> candidates = tripRepository.findByPickupLocationOrRoutePathContaining(from, from);

        java.util.List<Trip> result = new java.util.ArrayList<>();

        for (Trip trip : candidates) {
            if (isSubRoute(trip, from, to)) {
                result.add(trip);
            }
        }
        return result;
    }

    private boolean isSubRoute(Trip trip, String from, String to) {
        // Construct full path: Pickup -> [RoutePath] -> Drop
        java.util.List<String> fullPath = new java.util.ArrayList<>();
        fullPath.add(trip.getPickupLocation());

        if (trip.getRoutePath() != null && !trip.getRoutePath().isEmpty()) {
            String[] stops = trip.getRoutePath().split(",");
            for (String stop : stops) {
                fullPath.add(stop.trim());
            }
        }
        fullPath.add(trip.getDropLocation());

        int fromIndex = -1;
        int toIndex = -1;

        for (int i = 0; i < fullPath.size(); i++) {
            if (fullPath.get(i).equalsIgnoreCase(from))
                fromIndex = i;
            if (fullPath.get(i).equalsIgnoreCase(to))
                toIndex = i;
        }

        return fromIndex != -1 && toIndex != -1 && fromIndex < toIndex;
    }

    public Trip createTripWithPricing(Long customerId, com.neurofleetx.trip.dto.TripRequestDTO request,
            Double distanceKm, String tripType) {
        com.neurofleetx.auth.entity.User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Double price = com.neurofleetx.trip.util.PriceCalculator.calculatePrice(distanceKm, tripType);

        Trip trip = Trip.builder()
                .customer(customer)
                .pickupLocation(request.getPickupLocation())
                .dropLocation(request.getDropLocation())
                .status(TripStatus.REQUESTED)
                .createdAt(java.time.LocalDateTime.now())
                .distance(distanceKm)
                .price(price)
                .tripType(tripType)
                .build();

        return tripRepository.save(trip);
    }
}
