package com.neurofleetx.trip.repository;

import com.neurofleetx.trip.entity.Booking;
import com.neurofleetx.trip.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByTripOffer_Driver_IdAndStatus(Long driverId, BookingStatus status);
}
