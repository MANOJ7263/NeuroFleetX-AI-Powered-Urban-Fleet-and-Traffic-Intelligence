package com.neurofleetx.trip.entity;

import com.neurofleetx.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_offer_id", nullable = false)
    private TripOffer tripOffer;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String dropLocation;

    @Column(nullable = false)
    private Double distanceKm;

    @Column(nullable = false)
    private Double totalPrice;

    @Builder.Default
    private boolean isOneWay = true; // Default to one way, if false implies round trip logic if needed?
    // Requirement says: "If the trip is 'One Way', add 40% return cost surcharge."
    // This implies OneWay is matching the request type.

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}
