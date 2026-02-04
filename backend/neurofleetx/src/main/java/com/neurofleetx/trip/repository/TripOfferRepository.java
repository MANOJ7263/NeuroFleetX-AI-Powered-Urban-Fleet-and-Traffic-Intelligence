package com.neurofleetx.trip.repository;

import com.neurofleetx.trip.entity.TripOffer;
import com.neurofleetx.trip.entity.TripOfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TripOfferRepository extends JpaRepository<TripOffer, Long> {
    List<TripOffer> findByStatus(TripOfferStatus status);

    List<TripOffer> findByDriverId(Long driverId);

    @Query("SELECT t FROM TripOffer t WHERE t.status = 'ACTIVE' AND (LOWER(t.source) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<TripOffer> searchActiveOffers(@Param("query") String query);

    @Query("SELECT t FROM TripOffer t JOIN FETCH t.vehicle v JOIN FETCH t.driver d WHERE t.status = 'ACTIVE' AND v.isApproved = true")
    List<TripOffer> findActiveApprovedOffers();
}
