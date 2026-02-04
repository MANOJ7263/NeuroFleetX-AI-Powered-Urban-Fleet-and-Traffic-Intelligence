package com.neurofleetx.trip.entity;

import com.neurofleetx.auth.entity.User;
import com.neurofleetx.vehicle.entity.Vehicle;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CUSTOMER who requested the trip
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // DRIVER assigned by admin
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    // Vehicle assigned
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private String pickupLocation;
    private String dropLocation;

    // New fields for business logic
    private Double distance; // in km
    private Double price;
    private String tripType; // "ONE_WAY" or "ROUND_TRIP"
    private String routePath; // e.g. "CityA,CityB,CityC"

    @Enumerated(EnumType.STRING)
    private TripStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
