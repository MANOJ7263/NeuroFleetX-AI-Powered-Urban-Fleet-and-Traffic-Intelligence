package com.neurofleetx.trip.service;

import org.springframework.stereotype.Service;
import java.time.LocalTime;

@Service
public class ETAPredictionService {

    /**
     * Adjusts the estimated time of arrival based on historical traffic patterns
     * using a placeholder ML model.
     * 
     * @param baseEtaMinutes The calculated base ETA in minutes.
     * @return Adjusted ETA in minutes.
     */
    public double adjustEtaWithML(double baseEtaMinutes) {
        LocalTime now = LocalTime.now();
        // Simple heuristic: Peak hours (08:00-10:00 and 17:00-19:00) increase traffic
        // by 20%
        boolean isPeak = (now.getHour() >= 8 && now.getHour() <= 10) ||
                (now.getHour() >= 17 && now.getHour() <= 19);

        if (isPeak) {
            // Apply +20% factor
            return baseEtaMinutes * 1.20;
        }

        return baseEtaMinutes;
    }
}
