package com.neurofleetx.trip.controller;

import com.neurofleetx.auth.repository.UserRepository;
import com.neurofleetx.trip.entity.TripOffer;
import com.neurofleetx.trip.service.TripOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@CrossOrigin
public class TripOfferController {

    private final TripOfferService tripOfferService;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping
    public ResponseEntity<TripOffer> createOffer(@RequestBody com.neurofleetx.trip.dto.TripOfferRequest request,
            Authentication authentication) {
        Long driverId = extractUserId(authentication);
        TripOffer offer = new TripOffer();
        offer.setSource(request.getSource());
        offer.setDestination(request.getDestination());
        offer.setStartTime(request.getStartTime());
        offer.setAvailableSeats(request.getAvailableSeats());

        com.neurofleetx.vehicle.entity.Vehicle vehicle = new com.neurofleetx.vehicle.entity.Vehicle();
        vehicle.setId(request.getVehicleId());
        offer.setVehicle(vehicle);

        return ResponseEntity.ok(tripOfferService.createOffer(driverId, offer));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TripOffer>> searchOffers(@RequestParam String source, @RequestParam String destination) {
        return ResponseEntity.ok(tripOfferService.findMatchingOffers(source, destination));
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null)
            return null;
        return userRepository.findByEmail(authentication.getName())
                .map(com.neurofleetx.auth.entity.User::getId).orElse(null);
    }
}
