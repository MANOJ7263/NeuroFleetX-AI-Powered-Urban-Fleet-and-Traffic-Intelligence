package com.neurofleetx.review.repository;

import com.neurofleetx.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVehicleId(Long vehicleId);

    List<Review> findByCustomerId(Long customerId);

    List<Review> findByVehicle_Driver_Id(Long driverId);
}
