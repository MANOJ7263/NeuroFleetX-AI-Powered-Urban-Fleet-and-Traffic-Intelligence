package com.neurofleetx.trip.controller;

import com.neurofleetx.auth.entity.User;
import com.neurofleetx.auth.repository.UserRepository;
import com.neurofleetx.trip.entity.Trip;
import com.neurofleetx.trip.service.TripService;
import com.neurofleetx.trip.service.RoutingService;
import com.neurofleetx.trip.service.ETAPredictionService;
import com.neurofleetx.trip.service.GoogleMapsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin
public class TripController {

    private final TripService tripService;
    private final UserRepository userRepository;
    private final RoutingService routingService;
    private final ETAPredictionService etaPredictionService;
    private final GoogleMapsService googleMapsService;
    private final com.neurofleetx.trip.service.TripOfferService tripOfferService;

    public TripController(TripService tripService,
            UserRepository userRepository,
            RoutingService routingService,
            ETAPredictionService etaPredictionService,
            GoogleMapsService googleMapsService,
            com.neurofleetx.trip.service.TripOfferService tripOfferService) {
        this.tripService = tripService;
        this.userRepository = userRepository;
        this.routingService = routingService;
        this.etaPredictionService = etaPredictionService;
        this.googleMapsService = googleMapsService;
        this.tripOfferService = tripOfferService;
    }

    /**
     * RECOMMENDATIONS: Get trip recommendations
     */
    @GetMapping("/recommendations")
    public ResponseEntity<java.util.List<String>> getRecommendations(@RequestParam String query) {
        return ResponseEntity.ok(tripOfferService.getTripRecommendations(query));
    }

    /**
     * DRIVER: Get current assigned trip
     */
    @GetMapping("/driver/current")
    public ResponseEntity<?> getCurrentTrip(Authentication authentication) {

        Long driverId = extractUserId(authentication);
        if (driverId == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Optional<Trip> trip = tripService.getCurrentTripForDriver(driverId);

        return trip
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * DRIVER: Start a trip
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/{tripId}/start")
    public ResponseEntity<Trip> startTrip(@PathVariable Long tripId) {
        // In a real app, verify driver ownership here
        return ResponseEntity.ok(tripService.startTrip(tripId));
    }

    /**
     * CUSTOMER: Request a trip
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/request")
    public ResponseEntity<Trip> requestTrip(@RequestBody com.neurofleetx.trip.dto.TripRequestDTO request,
            Authentication authentication) {
        Long customerId = extractUserId(authentication);
        if (customerId == null) {
            throw new RuntimeException("User not authenticated");
        }

        // Use pricing logic if distance provided, otherwise fallback (or require
        // distance)
        // For this task, we assume distance is part of the request for calculation
        Double distance = request.getDistance() != null ? request.getDistance() : 0.0;
        String tripType = request.getTripType() != null ? request.getTripType() : "ONE_WAY";

        return ResponseEntity.ok(tripService.createTripWithPricing(customerId, request, distance, tripType));
    }

    /**
     * ADMIN/MANAGER: Assign trip
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{tripId}/assign")
    public ResponseEntity<Trip> assignTrip(@PathVariable Long tripId,
            @RequestBody com.neurofleetx.trip.dto.AssignTripDTO assignTripDTO) {
        return ResponseEntity
                .ok(tripService.assignTrip(tripId, assignTripDTO.getDriverId(), assignTripDTO.getVehicleId()));
    }

    /**
     * ADMIN/MANAGER: Get all pending (REQUESTED) trips
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/pending")
    public ResponseEntity<java.util.List<Trip>> getPendingTrips() {
        return ResponseEntity.ok(tripService.getPendingTrips());
    }

    /**
     * Search for trips (including sub-routes)
     */
    @GetMapping("/search")
    public ResponseEntity<java.util.List<Trip>> searchTrips(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(tripService.findMatchingTrips(from, to));
    }

    /**
     * Extract user ID from JWT authentication
     */
    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        String email = authentication.getName();
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(User::getId).orElse(null);
    }

    /**
     * Get active approved trip offers (available for booking)
     */
    @GetMapping("/active")
    public ResponseEntity<java.util.List<com.neurofleetx.trip.entity.TripOffer>> getActiveTrips() {
        return ResponseEntity.ok(tripOfferService.getActiveApprovedOffers());
    }

    /**
     * OPTIMIZATION: Get optimized route
     */
    @PostMapping("/optimize")
    public ResponseEntity<com.neurofleetx.trip.dto.OptimizationResponseDTO> optimizeTrip(
            @RequestBody com.neurofleetx.trip.dto.OptimizationRequestDTO request) {

        com.google.maps.model.DirectionsResult directions = routingService.getDirections(request.getOrigin(),
                request.getDestination());

        if (directions == null || directions.routes == null || directions.routes.length == 0) {
            return ResponseEntity.badRequest().build();
        }

        com.google.maps.model.DirectionsRoute route = directions.routes[0];

        // Calculate totals
        long totalDistanceMeters = 0;
        long totalDurationSeconds = 0;
        for (com.google.maps.model.DirectionsLeg leg : route.legs) {
            if (leg.distance != null)
                totalDistanceMeters += leg.distance.inMeters;
            if (leg.duration != null)
                totalDurationSeconds += leg.duration.inSeconds;
        }

        double totalDistanceKm = totalDistanceMeters / 1000.0;
        double baseTimeMinutes = totalDurationSeconds / 60.0;

        // ML Adjustment
        double adjustedEta = etaPredictionService.adjustEtaWithML(baseTimeMinutes);

        // Decode Polyline to Path (List<Node>) for backward compatibility / frontend
        // rendering
        java.util.List<com.neurofleetx.trip.util.RouteGraph.Node> pathNodes = new java.util.ArrayList<>();

        // Use our RoutingService's sample graph to get REAL coordinates for the demo
        // path
        // because the mock polyline string above might not align with the map center.
        com.neurofleetx.trip.util.RouteGraph graph = routingService.createSampleGraph();
        // Manually construct the path for the demo "Coimbatore -> Chennai"
        if (graph.getNodes().containsKey("Coimbatore"))
            pathNodes.add(graph.getNodes().get("Coimbatore"));
        if (graph.getNodes().containsKey("Tiruppur"))
            pathNodes.add(graph.getNodes().get("Tiruppur"));
        if (graph.getNodes().containsKey("Erode"))
            pathNodes.add(graph.getNodes().get("Erode"));
        if (graph.getNodes().containsKey("Salem"))
            pathNodes.add(graph.getNodes().get("Salem"));
        if (graph.getNodes().containsKey("Chennai"))
            pathNodes.add(graph.getNodes().get("Chennai"));

        if (pathNodes.isEmpty() && route.overviewPolyline != null) {
            java.util.List<com.google.maps.model.LatLng> decodedPath = route.overviewPolyline.decodePath();
            for (com.google.maps.model.LatLng latLng : decodedPath) {
                pathNodes.add(new com.neurofleetx.trip.util.RouteGraph.Node(
                        "node_" + latLng.lat + "_" + latLng.lng,
                        latLng.lat,
                        latLng.lng));
            }
        }

        return ResponseEntity.ok(com.neurofleetx.trip.dto.OptimizationResponseDTO.builder()
                .path(pathNodes)
                .totalDistanceKm(totalDistanceKm)
                .baseTimeMinutes(baseTimeMinutes)
                .estimatedTimeMinutes(adjustedEta)
                .directionsResult(directions)
                .build());
    }
}
