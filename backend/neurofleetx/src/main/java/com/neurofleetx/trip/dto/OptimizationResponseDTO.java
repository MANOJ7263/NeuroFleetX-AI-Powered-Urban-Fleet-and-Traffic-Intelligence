package com.neurofleetx.trip.dto;

import com.neurofleetx.trip.util.RouteGraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationResponseDTO {
    private List<RouteGraph.Node> path;
    private double totalDistanceKm;
    private double estimatedTimeMinutes;
    private double baseTimeMinutes;
    private com.google.maps.model.DirectionsResult directionsResult;
}
