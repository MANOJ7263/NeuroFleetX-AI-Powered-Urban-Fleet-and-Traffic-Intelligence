package com.neurofleetx.trip.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TripOfferRequest {
    private String source;
    private String destination;
    private LocalDateTime startTime;
    private Integer availableSeats;
    private Long vehicleId;
}
