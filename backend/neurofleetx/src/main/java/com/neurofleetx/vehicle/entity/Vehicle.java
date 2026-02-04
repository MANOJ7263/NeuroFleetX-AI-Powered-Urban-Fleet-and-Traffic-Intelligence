package com.neurofleetx.vehicle.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import com.neurofleetx.auth.entity.User;

@Entity
@Table(name = "vehicles")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE vehicles SET is_deleted = true WHERE id = ?")
@org.hibernate.annotations.SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id")
    private User driver;

    private String driverName;
    private String driverPhone;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String driverPhoto;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String vehiclePhoto;

    @Builder.Default
    private boolean isApproved = false;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Vehicle number is required")
    @Size(min = 5, max = 20, message = "Vehicle number must be between 5 and 20 characters")
    private String vehicleNumber; // e.g. TN09AB1234

    @Column(nullable = false)
    @NotBlank(message = "Model is required")
    @Size(max = 50, message = "Model name must not exceed 50 characters")
    private String model; // e.g. Swift, i20

    @Column(nullable = false)
    @NotBlank(message = "Type is required")
    private String type; // CAR, BIKE, VAN

    @Column(nullable = false)
    private boolean active = true; // availability - default to true

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column
    private Double costPerHour = 50.0;

    @Column(unique = true)
    private String licensePlate;

    private Double batteryPercentage = 100.0;

    private Integer seatCapacity = 4;

    @Builder.Default
    private boolean isDeleted = false;

    @Builder.Default
    private Double batteryLevel = 100.0;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Double totalKilometers = 0.0;
}
