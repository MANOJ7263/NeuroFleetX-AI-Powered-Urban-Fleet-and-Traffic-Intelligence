package com.neurofleetx.trip.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TripRequestDTO {
    private String pickupLocation;
    private String dropLocation;
    private Double distance;
    private String tripType;
}
