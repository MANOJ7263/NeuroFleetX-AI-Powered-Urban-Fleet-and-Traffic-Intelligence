package com.neurofleetx.trip.entity;

import com.neurofleetx.auth.entity.User;
import com.neurofleetx.vehicle.entity.Vehicle;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trip_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @ElementCollection
    private List<String> routeWaypoints;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TripOfferStatus status = TripOfferStatus.ACTIVE;
}
