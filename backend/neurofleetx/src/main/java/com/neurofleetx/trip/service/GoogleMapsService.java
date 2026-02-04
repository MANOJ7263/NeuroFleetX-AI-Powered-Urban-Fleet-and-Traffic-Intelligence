package com.neurofleetx.trip.service;

import com.google.maps.GeoApiContext;
import com.google.maps.DistanceMatrixApi;
import com.google.maps.model.DistanceMatrix;
import com.google.maps.model.TravelMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class GoogleMapsService {

    @Value("${google.maps.api.key:}")
    private String apiKey;

    private GeoApiContext context;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isEmpty()) {
            context = new GeoApiContext.Builder()
                    .apiKey(apiKey)
                    .build();
        }
    }

    public DistanceMatrix getDistanceMatrix(String[] origins, String[] destinations) {
        if (context == null) {
            // Fallback for when API key is not configured
            System.out.println("Google Maps API Key not configured. Returning null for DistanceMatrix.");
            return null;
        }

        try {
            return DistanceMatrixApi.newRequest(context)
                    .origins(origins)
                    .destinations(destinations)
                    .mode(TravelMode.DRIVING)
                    .await();
        } catch (Exception e) {
            // Log error
            System.err.println("Error fetching Distance Matrix: " + e.getMessage());
            return null;
        }
    }

    public com.google.maps.model.DirectionsResult getDirections(String origin, String destination) {
        if (context == null) {
            System.out.println("Google Maps API Key not configured. Returning Mock Directions.");
            return createMockDirections(origin, destination);
        }

        try {
            return com.google.maps.DirectionsApi.newRequest(context)
                    .origin(origin)
                    .destination(destination)
                    .mode(TravelMode.DRIVING)
                    .alternatives(true)
                    .await();
        } catch (Exception e) {
            System.err.println("Error fetching Directions: " + e.getMessage() + ". Returning Mock Directions.");
            return createMockDirections(origin, destination);
        }
    }

    private com.google.maps.model.DirectionsResult createMockDirections(String origin, String destination) {
        // Create a mock DirectionsResult for demo purposes when API key is missing
        com.google.maps.model.DirectionsResult result = new com.google.maps.model.DirectionsResult();
        result.routes = new com.google.maps.model.DirectionsRoute[1];

        com.google.maps.model.DirectionsRoute route = new com.google.maps.model.DirectionsRoute();
        route.summary = "Mock AI Route via Highway";
        // Valid Encoded Polyline for testing (Coimbatore -> Chennai approx straight
        // line)
        route.overviewPolyline = new com.google.maps.model.EncodedPolyline("ik|mA_~u|O_@`@a@`@_@`@a@`@_@`@a@`@_@`@");

        com.google.maps.model.DirectionsLeg leg = new com.google.maps.model.DirectionsLeg();
        leg.startAddress = origin;
        leg.endAddress = destination;

        // Mock distance/duration
        leg.distance = new com.google.maps.model.Distance();
        leg.distance.humanReadable = "510 km";
        leg.distance.inMeters = 510000;

        leg.duration = new com.google.maps.model.Duration();
        leg.duration.humanReadable = "8 hours";
        leg.duration.inSeconds = 28800;

        // Mock Steps
        com.google.maps.model.DirectionsStep step1 = new com.google.maps.model.DirectionsStep();
        step1.htmlInstructions = "Head north on <b>Main St</b>";
        step1.distance = leg.distance;
        step1.duration = leg.duration;
        step1.polyline = new com.google.maps.model.EncodedPolyline("ik|mA_~u|O");
        // Mock location for steps
        step1.startLocation = new com.google.maps.model.LatLng(11.0168, 76.9558);
        step1.endLocation = new com.google.maps.model.LatLng(13.0827, 80.2707);

        leg.steps = new com.google.maps.model.DirectionsStep[] { step1 };

        route.legs = new com.google.maps.model.DirectionsLeg[] { leg };
        result.routes[0] = route;

        return result;
    }
}
