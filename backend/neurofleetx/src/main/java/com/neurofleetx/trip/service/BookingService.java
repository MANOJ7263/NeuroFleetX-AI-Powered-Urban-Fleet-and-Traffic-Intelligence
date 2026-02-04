package com.neurofleetx.trip.service;

import com.neurofleetx.auth.entity.User;
import com.neurofleetx.auth.repository.UserRepository;
import com.neurofleetx.trip.entity.Booking;
import com.neurofleetx.trip.entity.BookingStatus;
import com.neurofleetx.trip.entity.TripOffer;
import com.neurofleetx.trip.entity.TripOfferStatus;
import com.neurofleetx.trip.repository.BookingRepository;
import com.neurofleetx.trip.repository.TripOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TripOfferRepository tripOfferRepository;
    private final UserRepository userRepository;

    public Booking createBooking(Long customerId, Long tripOfferId, String pickup, String drop, Double distanceKm,
            boolean isOneWay) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        TripOffer offer = tripOfferRepository.findById(tripOfferId)
                .orElseThrow(() -> new RuntimeException("Trip Offer not found"));

        if (offer.getAvailableSeats() != null && offer.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available");
        }

        // Pricing Logic
        // Base: 30 Rs per km
        // Surcharge: 40% if One Way (Wait, requirements said: "If the trip is 'One
        // Way', add a 40% return cost surcharge.")
        // Interpreting this as: Price = (30 * distance) + (isOneWay ? (30 * distance *
        // 0.40) : 0) ?
        // Or is it "Return cost" meaning if OneWay, we charge them for the return trip?
        // "return cost surcharge" implies we charge extra because driver returns empty.
        // Usually, 30 Rs/km * Dist * 1.4 is reasonable interpretation.

        Double basePrice = 30.0 * distanceKm;
        Double finalPrice = basePrice;

        if (isOneWay) {
            finalPrice += (basePrice * 0.40);
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .tripOffer(offer)
                .pickupLocation(pickup)
                .dropLocation(drop)
                .distanceKm(distanceKm)
                .isOneWay(isOneWay)
                .totalPrice(finalPrice)
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public java.util.List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING);
    }

    public Booking updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);

        if (status == BookingStatus.CONFIRMED) {
            TripOffer offer = booking.getTripOffer();
            if (offer.getAvailableSeats() != null && offer.getAvailableSeats() > 0) {
                offer.setAvailableSeats(offer.getAvailableSeats() - 1);

                // If seats exhausted, mark trip as BOOKED/FULL (Assuming ACTIVE implies
                // available)
                // Actually, if seats=0, it won't be shown in search if search logic checks
                // seats>0.
                // But for Manager Dashboard "Available Trips", we should update status if we
                // want to hide it completely.
                // Or simply rely on seats.
                // User said: "untill complete the trip he is unavailable".
                // We should mark offer as FULL or similar.
                // Let's assume ACTIVE is fine if search filters by seats.
                // But if we want to mark driver busy?
                // For now, seat deduction is key.
                if (offer.getAvailableSeats() == 0) {
                    offer.setStatus(TripOfferStatus.FULL);
                }

                tripOfferRepository.save(offer);
            }
        }

        return bookingRepository.save(booking);
    }

    public java.util.List<Booking> getDriverPendingBookings(Long driverId) {
        return bookingRepository.findByTripOffer_Driver_IdAndStatus(driverId, BookingStatus.PENDING);
    }

    public java.util.List<Booking> getDriverConfirmedBookings(Long driverId) {
        return bookingRepository.findByTripOffer_Driver_IdAndStatus(driverId, BookingStatus.CONFIRMED);
    }

    public Booking cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        TripOffer offer = booking.getTripOffer();

        if (!offer.getDriver().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (java.time.LocalDateTime.now().isAfter(offer.getStartTime().minusHours(3))) {
            throw new RuntimeException("Cannot cancel within 3 hours of start time");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        offer.setAvailableSeats(offer.getAvailableSeats() + 1);
        if (offer.getStatus() == com.neurofleetx.trip.entity.TripOfferStatus.FULL) {
            offer.setStatus(com.neurofleetx.trip.entity.TripOfferStatus.ACTIVE);
        }
        tripOfferRepository.save(offer);
        return bookingRepository.save(booking);
    }

    public java.util.List<Booking> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }
}
