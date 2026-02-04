package com.neurofleetx.trip.service;

import com.neurofleetx.auth.entity.User;
import com.neurofleetx.auth.repository.UserRepository;
import com.neurofleetx.trip.entity.TripOffer;
import com.neurofleetx.trip.entity.TripOfferStatus;
import com.neurofleetx.trip.repository.TripOfferRepository;
import com.neurofleetx.vehicle.entity.Vehicle;
import com.neurofleetx.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripOfferService {

    private final TripOfferRepository tripOfferRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final com.neurofleetx.review.service.ReviewService reviewService;

    public List<TripOffer> getActiveApprovedOffers() {
        List<TripOffer> offers = tripOfferRepository.findActiveApprovedOffers();
        for (TripOffer offer : offers) {
            if (offer.getDriver() != null) {
                Long driverId = offer.getDriver().getId();
                offer.getDriver().setDriverRatingLabel(reviewService.getDriverRating(driverId));
                offer.getDriver().setTotalTrips(reviewService.getDriverTotalTrips(driverId));
            }
        }
        return offers;
    }

    public TripOffer createOffer(Long driverId, TripOffer offer) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findById(offer.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.isApproved()) {
            throw new RuntimeException("Vehicle is not approved yet");
        }

        offer.setDriver(driver);
        offer.setVehicle(vehicle);
        offer.setStatus(TripOfferStatus.ACTIVE);

        return tripOfferRepository.save(offer);
    }

    public List<TripOffer> findMatchingOffers(String source, String destination) {
        // Simplified Logic:
        // 1. Get all Active offers
        // 2. Check if Source matches Offer Source OR is in Waypoints
        // 3. Check if Destination matches Offer Destination OR is in Waypoints
        // 4. (Ideally check order, here assuming basic match)

        List<TripOffer> activeOffers = tripOfferRepository.findByStatus(TripOfferStatus.ACTIVE);

        return activeOffers.stream().filter(offer -> isMatch(offer, source, destination)).collect(Collectors.toList());
    }

    private boolean isMatch(TripOffer offer, String requestSource, String requestDest) {
        // Matches if Request Source is (Start OR in Waypoints) AND Request Dest is (End
        // OR in Waypoints)
        // Simplification: Not checking strict order for now unless waypoints are
        // ordered list and we scan indices
        boolean srcMatch = offer.getSource().equalsIgnoreCase(requestSource)
                || (offer.getRouteWaypoints() != null && offer.getRouteWaypoints().contains(requestSource));

        boolean destMatch = offer.getDestination().equalsIgnoreCase(requestDest)
                || (offer.getRouteWaypoints() != null && offer.getRouteWaypoints().contains(requestDest));

        return srcMatch && destMatch;
    }

    public List<String> getTripRecommendations(String query) {
        List<TripOffer> offers = tripOfferRepository.searchActiveOffers(query);

        return offers.stream()
                .filter(offer -> offer.getVehicle() != null && offer.getVehicle().isActive()
                        && offer.getVehicle().isApproved())
                .map(offer -> offer.getSource() + " to " + offer.getDestination())
                .distinct()
                .collect(Collectors.toList());
    }
}
